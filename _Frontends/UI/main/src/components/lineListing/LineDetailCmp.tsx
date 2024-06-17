import { DistrictService } from "#service/DistrictService";
import { LineData, LineDetails, LineManagementService, MapViewerOptions, StationData, VehicleData } from "#service/LineManagementService";
import "#styles/LineDetailCmp.scss";
import "#styles/TLM_LineDetail.scss";
import { Cs2CheckboxWithLine, Cs2FormLine, DefaultPanelScreen, Entity, UnitSystem, durationToGameMinutes, getGameUnits, kilogramsTo, metersTo, nameToString, replaceArgs, setupSignificance } from "@klyte45/euis-components";
import { Component } from "react";
import translate from "#utility/translate"
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { TlmViewerCmp } from "./containers/TlmViewerCmp";
import { LineViewGeneralPageCmp } from "./subpages/LineViewGeneralPageCmp";

enum MapViewerTabsNames {
    General = "tabGeneralSettings",
    LineData = "tabLineData",
    LineSettings = "tabSettings",
    Debug = "tabDebug",
    MapSettings = "mapSettings",
    StopInfo = "stopData",
    VehicleInfo = "vehicleData"
}

const tabsOrder: (MapViewerTabsNames | undefined)[] = [
    MapViewerTabsNames.General,
    MapViewerTabsNames.LineData,
    MapViewerTabsNames.LineSettings,
    //MapViewerTabsNames.Debug,
    undefined,
    MapViewerTabsNames.MapSettings,
    MapViewerTabsNames.StopInfo,
    MapViewerTabsNames.VehicleInfo
]

const clickableTabs = [
    MapViewerTabsNames.General,
    MapViewerTabsNames.LineData,
    MapViewerTabsNames.LineSettings,
    MapViewerTabsNames.Debug,
    MapViewerTabsNames.MapSettings
]

type State = {
    lineDetails?: LineDetails,

    currentTab: number,
    measureUnit: UnitSystem,
    currentStopSelected?: StationData,
    isLineSimetric?: boolean
}

type Props = {
    currentLine: Entity,
    getLineById: (x: number) => LineData,
    setSelection: (x: Entity) => Promise<void>,
    onBack: () => void,
    onForceReload(): void,
    mapViewOptions: MapViewerOptions,
    setMapViewOptions: (options: MapViewerOptions) => any
}

export default class LineDetailCmp extends Component<Props, State> {
    constructor(props: any) {
        super(props);
        this.state = {

            currentTab: 0,
            measureUnit: UnitSystem.Metric
        }
    }

    componentDidMount() {
        engine.whenReady.then(async () => {
            engine.on("k45::xtm.lineViewer.getRouteDetail->", (details: State['lineDetails']) => {
                if (details.LineData.entity.Index != this.props.currentLine.Index) return;

                details.Vehicles = details.Vehicles.map(x => {
                    return {
                        ...x,
                        ...this.enrichVehicleInfo(x, details.Stops, details.LineData.length)
                    }
                })
                details.Stops = details.Stops.map((x, _, arr) => {
                    return {
                        ...x,
                        ...this.enrichStopInfo(x, arr, details.Vehicles, details.LineData)
                    }
                })
                this.setState({
                    lineDetails: details,
                    isLineSimetric: checkSimetry(details.Stops)
                }, () => this.reloadData());
            });

            engine.on("k45::xtm.common.onMeasureUnitsChanged", this.measureCallback);
            getGameUnits().then(async (x) => {
                this.setState({ measureUnit: x.unitSystem.value__ });
            });
            engine.on("k45::xtm.lineViewer.getCityLines->!", async (x) => {
                this.reloadData();
            });
        })
        this.reloadData(true);
    }
    enrichStopInfo(station: StationData, allStations: StationData[], vehicles: VehicleData[], lineData: LineData): Partial<StationData> {
        const arrivingVehicle = vehicles.length == 0 ? [] : vehicles.map(x => [x.position > station.position ? x.position - 1 : x.position, x] as [number, VehicleData]).sort((a, b) => b[0] - a[0])[0]

        return {
            arrivingVehicle: arrivingVehicle[1],
            arrivingVehicleDistance: arrivingVehicle ? (station.position - arrivingVehicle[0]) * lineData.length : undefined,
            arrivingVehicleStops: arrivingVehicle ? allStations.map(x => x.position >= station.position ? x.position - 1 : x.position).filter(x => x > arrivingVehicle[0]).length : undefined,
        }
    }
    enrichVehicleInfo(vehicle: VehicleData, stations: StationData[], lineLength: number): Partial<VehicleData> {
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
    componentWillUnmount(): void {
        engine.off("k45::xtm.lineViewer.getRouteDetail->");
        engine.off("k45::xtm.common.onMeasureUnitsChanged", this.measureCallback);
        engine.off("k45::xtm.lineViewer.getCityLines->!");
    }

    private measureCallback = async () => this.setState({ measureUnit: (await getGameUnits()).unitSystem.value__ });

    async reloadData(force: boolean = false) {
        if (force || this.props.mapViewOptions.showVehicles) {
            await engine.call("k45::xtm.lineViewer.getRouteDetail", this.props.currentLine, force);
            if (force) {

            }
        }
    }
    render() {
        if (!this.props.currentLine) {
            return <>INVALID</>
        }
        const buttonsRow = <>
            <button className="negativeBtn " onClick={this.props.onBack}>{translate("lineViewer.backToList")}</button>
        </>
        const lineDetails = this.state.lineDetails;
        if (!lineDetails) return null;
        const lineCommonData = lineDetails?.LineData;
        const subtitle = !lineDetails ? undefined : Object.values(lineDetails.Stops.reduce((p, n) => {
            p[n.district.Index] = n
            return p;
        }, {} as Record<number, StationData>))
            .map(x => DistrictService.getEffectiveDistrictName(x)).join(" - ");

        const componentsMapViewer: Record<MapViewerTabsNames, () => JSX.Element> = {
            [MapViewerTabsNames.General]: () =>
                <DefaultPanelScreen title={translate("lineViewer.generalData")} isSubScreen={true}>
                    <LineViewGeneralPageCmp currentLine={lineCommonData} forceReload={() => { this.reloadData(true) }} />
                </DefaultPanelScreen>,
            [MapViewerTabsNames.LineData]: () =>
                <DefaultPanelScreen title={translate("lineViewer.lineData")} isSubScreen={true}>
                    <Cs2FormLine title={translate("lineViewer.dataTotalLength")} >{[metersTo(lineDetails.Segments.reduce((p, n) => p + n.sizeMeters, 0), this.state.measureUnit)].map(x => replaceArgs(engine.translate(x[0]), { ...x[1], "SIGN": "" }))[0]}</Cs2FormLine>
                    <Cs2FormLine title={translate("lineViewer.dataVehicleCount")} >{lineCommonData.vehicles}</Cs2FormLine>
                    <Cs2FormLine title={translate("lineViewer.dataStopsCount")} >{lineCommonData.stops}</Cs2FormLine>
                    <Cs2FormLine title={translate(lineCommonData.isCargo ? "lineViewer.dataTotalCargoWaiting" : "lineViewer.dataTotalPassengersWaiting")}>{
                        lineCommonData.isCargo
                            ? [kilogramsTo(lineDetails.Stops.reduce((p, n) => p + n.cargo, 0), this.state.measureUnit)].map(x => replaceArgs(engine.translate(x[0]), { ...x[1], "SIGN": "" }))[0]
                            : lineDetails.Stops.reduce((p, n) => p + n.cargo, 0)
                    }</Cs2FormLine>
                    <Cs2FormLine title={translate("lineViewer.dataLineFullLapAverageTime")} >{replaceArgs(translate("lineViewer.formatMinutes"), { minutes: durationToGameMinutes(lineDetails.Segments.reduce((p, n) => p + n.duration, 0)).toFixed() })}</Cs2FormLine>
                    <Cs2FormLine title={translate("lineViewer.dataNextVehicleToBeMaintained")} >
                        {lineDetails.Vehicles.filter(x => x.maintenanceRange > 0).sort((a, b) => (a.odometer - a.maintenanceRange) - (b.odometer - b.maintenanceRange)).filter((x, i) => i == 0).map(x =>
                            <>
                                {replaceArgs(translate("lineViewer.dataNextMaintenanceValueFmt"), { name: `${nameToString(x.name)} - ${x.entity.Index}`, distance: [metersTo(x.maintenanceRange - x.odometer, this.state.measureUnit)].map(x => replaceArgs(engine.translate(x[0]), { ...x[1], "SIGN": "" }))[0] })}
                            </>)[0] || translate("lineViewer.dataNoNextMaintenance")}
                    </Cs2FormLine>
                    <Cs2FormLine title={translate("lineViewer.dataAverageVehicleOccupance")}>{setupSignificance(lineDetails.Vehicles.reduce((p, n) => p + n.cargo / n.capacity, 0) / lineCommonData.vehicles * 100, 2)}%</Cs2FormLine>
                    <Cs2FormLine title={translate("lineViewer.dataAverageStopWaiting")} >{setupSignificance(lineDetails.Stops.reduce((p, n) => p + n.cargo / lineDetails.StopCapacity, 0) / lineCommonData.stops * 100, 2)}%</Cs2FormLine>
                </DefaultPanelScreen>,
            [MapViewerTabsNames.LineSettings]: () =>
                <DefaultPanelScreen title={translate("lineViewer.lineSettings")} isSubScreen={true}>
                    <Cs2FormLine title={"Coming soon!"} />
                </DefaultPanelScreen>,
            [MapViewerTabsNames.MapSettings]: () =>
                <DefaultPanelScreen title={translate("lineViewer.showOnMap")} isSubScreen={true}>
                    <Cs2CheckboxWithLine isChecked={() => this.props.mapViewOptions.showDistances} title={translate("lineViewer.showDistancesLbl")} onValueToggle={(x) => this.toggleDistances(x)} />
                    <Cs2CheckboxWithLine isChecked={() => this.props.mapViewOptions.showDistricts} title={translate("lineViewer.showDistrictsLbl")} onValueToggle={(x) => this.toggleDistricts(x)} />
                    <Cs2CheckboxWithLine isChecked={() => this.props.mapViewOptions.showVehicles} title={translate("lineViewer.showVehiclesLbl")} onValueToggle={(x) => this.toggleVehiclesShow(x)} />
                    <Cs2CheckboxWithLine isChecked={() => this.props.mapViewOptions.showIntegrations} title={translate("lineViewer.showIntegrationsLbl")} onValueToggle={(x) => this.toggleIntegrations(x)} />
                    <Cs2CheckboxWithLine isChecked={() => this.props.mapViewOptions.useWhiteBackground} title={translate("lineViewer.useWhiteBackgroundLbl")} onValueToggle={(x) => this.toggleWhiteBG(x)} />
                    <Cs2CheckboxWithLine isChecked={() => this.props.mapViewOptions.useHalfTripIfSimetric} title={translate("lineViewer.showHalfTripIfSimmetric")} onValueToggle={(x) => this.toggleUseHalfTripIfSimetric(x)} />
                </DefaultPanelScreen>,
            [MapViewerTabsNames.StopInfo]: () => <>
                <DefaultPanelScreen title={nameToString(this.state.currentStopSelected?.name)} isSubScreen={true} buttonsRowContent={<>
                    {
                        this.state.lineDetails?.Stops[0]?.entity.Index == this.state.currentStopSelected?.entity.Index
                            ? <button className="darkestBtn" disabled>{translate("lineViewer.alreadyFirstStop")}</button>
                            : <button className="neutralBtn" onClick={() => this.setSelectedAsFirstStop()}>{translate("lineViewer.setAsFirstStop")}</button>
                    }
                    {this.state.currentStopSelected?.parent?.Index
                        ? <button className="neutralBtn" onClick={() => LineManagementService.selectEntity(this.state.currentStopSelected.parent)}>{translate("lineViewer.selectBuilding")}</button>
                        : <button className="darkestBtn">{translate("lineViewer.notABuilding")}</button>
                    }
                    <button className="neutralBtn" onClick={() => LineManagementService.selectEntity(this.state.currentStopSelected.entity)}>{translate("lineViewer.selectStop")}</button>
                    <button className="neutralBtn" onClick={() => LineManagementService.focusToEntity(this.state.currentStopSelected.entity)}>{translate("lineViewer.goToStop")}</button>



                </>}>
                    <Cs2FormLine title={"Coming soon!"} />
                    {/* <img src="coui://cctv.xtm.k45/" />*/}
                </DefaultPanelScreen>
            </>,
            [MapViewerTabsNames.VehicleInfo]: () => <></>,
            [MapViewerTabsNames.Debug]: () => <>{JSON.stringify(this.state.lineDetails ?? "LOADING", null, 2)}</>
        }

        return <>
            <DefaultPanelScreen title={nameToString(lineDetails.LineData.name)} subtitle={subtitle} buttonsRowContent={buttonsRow}>
                <TlmViewerCmp
                    {...this.props.mapViewOptions}
                    lineCommonData={lineCommonData}
                    lineDetails={lineDetails}
                    getLineById={(x) => this.props.getLineById(x)}
                    setSelection={(x) => this.setSelection(x)}
                    onSelectStop={(x) => this.onStopSelected(x)}
                    simetricLine={this.state.isLineSimetric}
                />
                <div className="lineViewContent">
                    <Tabs selectedIndex={this.state.currentTab} onSelect={x => this.state.currentTab != x && this.setState({ currentTab: x })}>
                        <TabList id="sideNav" >
                            {tabsOrder.map((x, i) => !x ? <div className="space" key={i}></div> : <Tab key={i} disabled={!clickableTabs.includes(x)}>{translate("lineViewer." + x)}</Tab>)}
                        </TabList>
                        <div id="dataPanel">
                            {tabsOrder.map((x, i) => x && <TabPanel key={i}>{componentsMapViewer[x]()}</TabPanel>)}
                        </div>
                    </Tabs>
                </div>
            </DefaultPanelScreen>
        </>;
    }
    async setSelectedAsFirstStop() {
        const idx = this.state.lineDetails?.Stops.indexOf(this.state.currentStopSelected);
        const thisStop = this.state.lineDetails?.Stops[0];
        const nextStop = this.state.lineDetails?.Stops[idx];
        const refNextStopPos = nextStop.position < thisStop.position ? 1 + nextStop.position : nextStop.position;
        const totalDistanceSegments = this.state.lineDetails?.Segments.filter(x => x.end > thisStop.position && x.start < refNextStopPos);
        if (await LineManagementService.setFirstStop(this.props.currentLine, totalDistanceSegments.length)) {
            this.reloadData(true);
        } else {
            console.log("Failed setting first stop!")
        }
    }
    onStopSelected(x: StationData): void {
        let targetTabIdx = tabsOrder.filter(x => x).indexOf(MapViewerTabsNames.StopInfo);
        this.setState({ currentTab: targetTabIdx, currentStopSelected: x })
    }
    async setSelection(x: Entity) {
        await this.props.setSelection(x);
        this.reloadData(true);
    }
    private toggleWhiteBG(x: boolean): void {
        this.props.setMapViewOptions({ ...this.props.mapViewOptions, useWhiteBackground: x });
    }

    private toggleUseHalfTripIfSimetric(x: boolean): void {
        this.props.setMapViewOptions({ ...this.props.mapViewOptions, useHalfTripIfSimetric: x });
    }

    private toggleIntegrations(x: boolean): void {
        this.props.setMapViewOptions({ ...this.props.mapViewOptions, showIntegrations: x, showVehicles: this.props.mapViewOptions.showVehicles && !x });
    }

    private toggleDistricts(x: boolean): void {
        this.props.setMapViewOptions({ ...this.props.mapViewOptions, showDistricts: x });
    }

    private toggleDistances(x: boolean): void {
        this.props.setMapViewOptions({ ...this.props.mapViewOptions, showDistances: x });
    }

    private toggleVehiclesShow(x: boolean) {
        this.props.setMapViewOptions({ ...this.props.mapViewOptions, showVehicles: x, showIntegrations: this.props.mapViewOptions.showIntegrations && !x });
    }

}


function checkSimetry(stops: StationData[]): boolean {
    const length = stops.length;
    if (length % 1 == 1) return false;
    const otherSideIdx = stops.length / 2 + 1
    for (let i = 1; i < otherSideIdx; i++) {
        if (stops[i].parent.Index != stops[length - i].parent.Index) return false;
    }
    return true;
}

