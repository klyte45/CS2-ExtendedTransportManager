import { DistrictService } from "#service/DistrictService";
import { LineData, LineDetails, LineManagementService, MapViewerOptions, StationData, VehicleData } from "#service/LineManagementService";
import "#styles/LineDetailCmp.scss";
import "#styles/TLM_LineDetail.scss";
import translate from "#utility/translate";
import { DefaultPanelScreen, Entity, UnitSystem, getGameUnits, nameToString } from "@klyte45/euis-components";
import { useEffect, useMemo, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { TlmViewerCmp } from "./containers/TlmViewerCmp";
import { LineDetail_General } from "./subpages/LineDetail_General";
import { LineDetail_Data } from "./subpages/LineDetail_Data";
import { LineDetail_StopInfo } from "./subpages/LineDetail_StopInfo";
import { LineDetail_MapSettings } from "./subpages/LineDetail_MapSettings";
import { WEIntegrationService } from "#service/WEIntegrationService";
import { LineDetail_WriteEverywhere } from "./subpages/LineDetail_WriteEverywhere";
import { STIntegrationService } from "#service/STIntegrationService";
import { LineDetail_SmartTransportation } from "./subpages/LineDetail_SmartTransportation";

enum MapViewerTabsNames {
    General = "tabGeneralSettings",
    LineData = "tabLineData",
    SmartTransportation = "stIntegration",
    Debug = "tabDebug",
    MapSettings = "mapSettings",
    StopInfo = "stopData",
    VehicleInfo = "vehicleData",
    WEIntegration = "weIntegration"
}

const tabsOrder: (MapViewerTabsNames | undefined)[] = [
    MapViewerTabsNames.General,
    MapViewerTabsNames.LineData,
    undefined,
    MapViewerTabsNames.SmartTransportation,
    MapViewerTabsNames.WEIntegration,
    //MapViewerTabsNames.Debug,
    undefined,
    MapViewerTabsNames.MapSettings,
    MapViewerTabsNames.StopInfo,
    MapViewerTabsNames.VehicleInfo
]


type Props = {
    initialCurrentLine: Entity,
    getLineById: (x: number) => LineData,
    onBack: () => void,
    onForceReload(): void,
    mapViewOptions: MapViewerOptions,
    setMapViewOptions: (options: MapViewerOptions) => any
}

export const LineDetailCmp = ({ initialCurrentLine,
    getLineById,
    onBack,
    onForceReload,
    mapViewOptions,
    setMapViewOptions }: Props) => {
    const [currentLine, setCurrentLine] = useState(initialCurrentLine);
    const [currentTab, setCurrentTab] = useState(0);
    const [measureUnit, setMeasureUnit] = useState(UnitSystem.Metric);
    const [lineDetails, setLineDetails] = useState<LineDetails>();
    const [isLineSimetric, setIsLineSimetric] = useState(false);
    const [currentStopSelected, setCurrentStopSelected] = useState<StationData>();
    const [clickableTabs, setClickableTabs] = useState([
        MapViewerTabsNames.General,
        MapViewerTabsNames.LineData,
        MapViewerTabsNames.Debug,
        MapViewerTabsNames.MapSettings
    ]);

    useEffect(() => {
        engine.whenReady.then(async () => {
            engine.on("k45::xtm.common.onMeasureUnitsChanged", measureCallback);
            getGameUnits().then(async (x) => {
                setMeasureUnit(x.unitSystem.value__);
            });
        })
        return () => {
            engine.off("k45::xtm.common.onMeasureUnitsChanged", measureCallback);
        }
    }, [currentStopSelected])
    useEffect(() => {
        Promise.all([
            WEIntegrationService.isAvailable(),
            STIntegrationService.isAvailable()
        ]).then(([weAvailable, stAvailable]) => {
            const newClickableTabs = [...clickableTabs];
            if (weAvailable) newClickableTabs.push(MapViewerTabsNames.WEIntegration);
            if (stAvailable) newClickableTabs.push(MapViewerTabsNames.SmartTransportation);
            setClickableTabs(newClickableTabs);
        })
    }, [])
    useEffect(() => {
        const updateCallback = setInterval(() => reloadData(true), 3000);
        reloadData(true)
        return () => clearInterval(updateCallback);
    }, [currentLine])

    useEffect(() => {
        if (currentTab == tabsOrder.filter(x => x).indexOf(MapViewerTabsNames.StopInfo)) {
            var newStop = currentStopSelected ? lineDetails.Stops.find(x => x.entity.Index == currentStopSelected.entity.Index) : undefined;
            setCurrentStopSelected(newStop)
            if (!newStop) setCurrentTab(0);
        }
    }, [lineDetails])

    const measureCallback = async () => setMeasureUnit((await getGameUnits()).unitSystem.value__);

    function onStopSelected(x: StationData): void {
        let targetTabIdx = tabsOrder.filter(x => x).indexOf(MapViewerTabsNames.StopInfo);
        setCurrentTab(targetTabIdx)
        setCurrentStopSelected(x)
    }

    async function reloadData(force: boolean = false) {
        if (force || mapViewOptions.showVehicles) {
            const details = await LineManagementService.getRouteDetail(currentLine, force)
            if (details.LineData.entity.Index != currentLine.Index) return;
            details.Vehicles = details.Vehicles.map(x => {
                return {
                    ...x,
                    ...enrichVehicleInfo(x, details.Stops, details.LineData.length)
                }
            })
            details.Stops = details.Stops.map((x, i, arr) => {
                return {
                    ...x,
                    ...enrichStopInfo(i, x, arr, details.Vehicles, details.LineData)
                }
            })
            setLineDetails(details)
            setIsLineSimetric(LineManagementService.checkSimetry(details.Stops))
            if (force) {
                onForceReload?.();
            }
        }
    }
    async function setSelection(x: Entity) {
        setCurrentLine(x);
        reloadData(true);
    }
    if (!currentLine) {
        return <>INVALID</>
    }
    const buttonsRow = <>
        <button className="negativeBtn " onClick={onBack}>{translate("lineViewer.backToList")}</button>
    </>
    if (!lineDetails) return <>Loading...</>;
    const lineCommonData = lineDetails?.LineData;
    const subtitle = !lineDetails ? undefined : Object.values(lineDetails.Stops
        .reduce((p, n) => {
            p[n.district.Index] ??= n
            return p;
        }, {} as Record<number, StationData>))
        .map(x => x)
        .sort((a, b) => a.index - b.index)
        .map(x => DistrictService.getEffectiveDistrictName(x)).join(" - ");

    const componentsMapViewer: Record<MapViewerTabsNames, () => JSX.Element> = {
        [MapViewerTabsNames.General]: () => <LineDetail_General lineCommonData={lineCommonData} reloadData={reloadData} />,
        [MapViewerTabsNames.LineData]: () => <LineDetail_Data lineDetails={lineDetails} measureUnit={measureUnit} lineCommonData={lineCommonData} />,
        [MapViewerTabsNames.SmartTransportation]: () => <LineDetail_SmartTransportation lineDetails={lineDetails} />,
        [MapViewerTabsNames.MapSettings]: () => <LineDetail_MapSettings mapViewOptions={mapViewOptions} setMapViewOptions={setMapViewOptions} />,
        [MapViewerTabsNames.StopInfo]: () => <LineDetail_StopInfo currentStopSelected={currentStopSelected} lineDetails={lineDetails} measureUnit={measureUnit} reloadData={reloadData} onStopSelected={onStopSelected} />,
        [MapViewerTabsNames.VehicleInfo]: () => <></>,
        [MapViewerTabsNames.Debug]: () => <>{JSON.stringify(lineDetails ?? "LOADING", null, 2)}</>,
        [MapViewerTabsNames.WEIntegration]: () => <LineDetail_WriteEverywhere lineId={lineDetails.LineData.entity} stops={lineDetails.Stops} />
    }

    return <>
        <DefaultPanelScreen title={nameToString(lineDetails.LineData.name)} subtitle={subtitle} buttonsRowContent={buttonsRow}>
            <TlmViewerCmp
                {...mapViewOptions}
                lineCommonData={lineCommonData}
                lineDetails={lineDetails}
                getLineById={(x) => getLineById(x)}
                setSelection={(x) => setSelection(x)}
                onSelectStop={(x) => onStopSelected(x)}
                simetricLine={isLineSimetric}
                currentStopSelected={currentStopSelected}
            />
            <div className="lineViewContent">
                <Tabs selectedIndex={currentTab} onSelect={x => {
                    if (currentTab != x) {
                        setCurrentTab(x); setCurrentStopSelected(undefined)
                    }
                }}>
                    <TabList id="sideNav" >
                        {tabsOrder.map((x, i) => !x ? <div className="space" key={i}></div> : <Tab key={i} disabled={!clickableTabs.includes(x)}><div>{translate("lineViewer." + x)}</div></Tab>)}
                    </TabList>
                    <div id="dataPanel">
                        {tabsOrder.map((x, i) => x && <TabPanel key={i}>{componentsMapViewer[x]()}</TabPanel>)}
                    </div>
                </Tabs>
            </div>
        </DefaultPanelScreen>
    </>;
}

function enrichStopInfo(index: number, station: StationData, allStations: StationData[], vehicles: VehicleData[], lineData: LineData): Partial<StationData> {
    const arrivingVehicle = vehicles.length == 0 ? [] : vehicles.map(x => [x.position > station.position ? x.position - 1 : x.position, x] as [number, VehicleData]).sort((a, b) => b[0] - a[0])[0]

    return {
        arrivingVehicle: arrivingVehicle[1],
        arrivingVehicleDistance: arrivingVehicle ? (station.position - arrivingVehicle[0]) * lineData.length : undefined,
        arrivingVehicleStops: arrivingVehicle ? allStations.map(x => x.position >= station.position ? x.position - 1 : x.position).filter(x => x > arrivingVehicle[0]).length : undefined,
        index
    }
}
function enrichVehicleInfo(vehicle: VehicleData, stations: StationData[], lineLength: number): Partial<VehicleData> {
    const lastStationIdx = (stations.filter(x => x.position < vehicle.position).length + stations.length - 1) % stations.length;
    const currentStation = stations[lastStationIdx];
    const nextStation = stations[(lastStationIdx + 1) % stations.length]
    const nextStationPos = nextStation.position + (nextStation.position < currentStation.position ? 1 : 0)
    const totalDistanceStations = (nextStationPos - currentStation.position) * lineLength;
    const currentStationSegmentFraction = (vehicle.position - currentStation.position) / (nextStationPos - currentStation.position)
    return {
        normalizedPosition: (lastStationIdx + currentStationSegmentFraction) / stations.length,
        distanceNextStop: (1 - currentStationSegmentFraction) * totalDistanceStations,
        distancePrevStop: currentStationSegmentFraction * totalDistanceStations,
    }
}


