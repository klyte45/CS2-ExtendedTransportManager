import { DefaultPanelScreen } from "#components/common/DefaultPanelScreen";
import { Checkbox } from "#components/common/checkbox";
import { DistrictService } from "#service/DistrictService";
import { LineData, LineDetails, MapViewerOptions, StationData, VehicleData } from "#service/LineManagementService";
import "#styles/LineDetailCmp.scss";
import "#styles/TLM_LineDetail.scss";
import { Entity } from "#utility/Entity";
import { NameCustom, NameFormatted, nameToString } from "#utility/name.utils";
import translate from "#utility/translate";
import { Component } from "react";
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
    MapViewerTabsNames.Debug,
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
    mapViewOptions: MapViewerOptions
    currentTab: number
}

type Props = {
    currentLine: Entity,
    getLineById: (x: number) => LineData,
    setSelection: (x: Entity) => Promise<void>,
    onBack: () => void,
    onForceReload(): void
}

export default class LineDetailCmp extends Component<Props, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            mapViewOptions: {
                showDistricts: true,
                showDistances: true,
                showVehicles: false,
                showIntegrations: true,
                useWhiteBackground: false
            },
            currentTab: 0
        }
    }

    componentDidMount() {
        engine.whenReady.then(async () => {
            engine.on("k45::xtm.lineViewer.getRouteDetail->", (details: State['lineDetails']) => {
                if (details.LineData.entity.Index != this.props.currentLine.Index) return;
                console.log(details);

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
                this.setState({ lineDetails: details }, () => this.reloadData());
            });
        })
        this.reloadData(true);
    }
    enrichStopInfo(station: StationData, allStations: StationData[], vehicles: VehicleData[], lineData: LineData): Partial<StationData> {
        const arrivingVehicle = vehicles.length == 0 ? undefined : vehicles.map(x => [x.position > station.position ? x.position - 1 : x.position, x] as [number, VehicleData]).sort((a, b) => b[0] - a[0])[0]

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
    }

    async reloadData(force: boolean = false) {
        if (force || this.state.mapViewOptions.showVehicles) {
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

        const componentsMapViewer: Record<MapViewerTabsNames, JSX.Element> = {
            [MapViewerTabsNames.General]: <DefaultPanelScreen title={translate("lineViewer.generalData")} isSubScreen={true}>
                <LineViewGeneralPageCmp currentLine={lineCommonData} forceReload={() => { this.reloadData(true) }} />
            </DefaultPanelScreen>,
            [MapViewerTabsNames.LineData]: <></>,
            [MapViewerTabsNames.LineSettings]: <></>,
            [MapViewerTabsNames.MapSettings]: <DefaultPanelScreen title={translate("lineViewer.showOnMap")} isSubScreen={true}>
                <Checkbox isChecked={() => this.state.mapViewOptions.showDistances} title={translate("lineViewer.showDistancesLbl")} onValueToggle={(x) => this.toggleDistances(x)} />
                <Checkbox isChecked={() => this.state.mapViewOptions.showDistricts} title={translate("lineViewer.showDistrictsLbl")} onValueToggle={(x) => this.toggleDistricts(x)} />
                <Checkbox isChecked={() => this.state.mapViewOptions.showVehicles} title={translate("lineViewer.showVehiclesLbl")} onValueToggle={(x) => this.toggleVehiclesShow(x)} />
                <Checkbox isChecked={() => this.state.mapViewOptions.showIntegrations} title={translate("lineViewer.showIntegrationsLbl")} onValueToggle={(x) => this.toggleIntegrations(x)} />
                <Checkbox isChecked={() => this.state.mapViewOptions.useWhiteBackground} title={translate("lineViewer.useWhiteBackgroundLbl")} onValueToggle={(x) => this.toggleWhiteBG(x)} />
            </DefaultPanelScreen>,
            [MapViewerTabsNames.StopInfo]: <></>,
            [MapViewerTabsNames.VehicleInfo]: <></>,
            [MapViewerTabsNames.Debug]: <>{JSON.stringify(this.state.lineDetails ?? "LOADING", null, 2)}</>
        }

        return <>
            <DefaultPanelScreen title={nameToString(lineDetails.LineData.name)} subtitle={subtitle} buttonsRowContent={buttonsRow}>
                <TlmViewerCmp {...this.state.mapViewOptions} lineCommonData={lineCommonData} lineDetails={lineDetails} getLineById={(x) => this.props.getLineById(x)} setSelection={(x) => this.setSelection(x)} />
                <div className="lineViewContent">
                    <Tabs selectedIndex={this.state.currentTab} onSelect={x => this.state.currentTab != x && this.setState({ currentTab: x })}>
                        <TabList id="sideNav" >
                            {tabsOrder.map((x, i) => !x ? <div className="space" key={i}></div> : <Tab key={i} disabled={!clickableTabs.includes(x)}>{translate("lineViewer." + x)}</Tab>)}
                        </TabList>
                        <div id="dataPanel">
                            {tabsOrder.map((x, i) => x && <TabPanel key={i}>{componentsMapViewer[x]}</TabPanel>)}
                        </div>
                    </Tabs>
                </div>
            </DefaultPanelScreen>
        </>;
    }
    async setSelection(x: Entity) {
        await this.props.setSelection(x);
        this.reloadData(true);
    }
    private toggleWhiteBG(x: boolean): void {
        this.setState({ mapViewOptions: { ...this.state.mapViewOptions, useWhiteBackground: x } });
    }

    private toggleIntegrations(x: boolean): void {
        this.setState({ mapViewOptions: { ...this.state.mapViewOptions, showIntegrations: x, showVehicles: this.state.mapViewOptions.showVehicles && !x } }, () => this.reloadData());
    }

    private toggleDistricts(x: boolean): void {
        this.setState({ mapViewOptions: { ...this.state.mapViewOptions, showDistricts: x } });
    }

    private toggleDistances(x: boolean): void {
        this.setState({ mapViewOptions: { ...this.state.mapViewOptions, showDistances: x } });
    }

    private toggleVehiclesShow(x: boolean) {
        this.setState({ mapViewOptions: { ...this.state.mapViewOptions, showVehicles: x, showIntegrations: this.state.mapViewOptions.showIntegrations && !x } }, () => this.reloadData());
    }

}


