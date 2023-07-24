import { DefaultPanelScreen } from "#components/common/DefaultPanelScreen";
import "#styles/LineDetailCmp.scss";
import "#styles/TLM_LineDetail.scss";
import { ColorUtils } from "#utility/ColorUtils";
import { Entity } from "#utility/Entity";
import { NameCustom, NameFormatted, NameLocalized, nameToString } from "#utility/name.utils";
import translate from "#utility/translate";
import { CSSProperties, Component } from "react";
import { LineData } from "./LineListCmp";
import { StationContainerCmp } from "./containers/StationContainerCmp";
import { DistrictBorderContainerCmp } from "./containers/DistrictBorderContainerCmp";
import { MapVehicleContainerCmp } from "./containers/MapVehicleContainerCmp";
import { MapStationDistanceContainerCmp } from "./containers/MapStationDistanceContainerCmp";
import { TlmViewerCmp } from "./containers/TlmViewerCmp";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { Checkbox } from "#components/common/checkbox";

export type StationData = {
    readonly entity: Entity,
    readonly position: number,
    readonly cargo: number,
    readonly isCargo: boolean,
    readonly isOutsideConnection: boolean,
    readonly name: NameCustom | NameFormatted,
    readonly parent: Entity,
    readonly parentName: NameCustom | NameFormatted | NameLocalized,
    readonly district: Entity,
    readonly districtName: NameCustom | NameFormatted,
    readonly connectedLines: {
        readonly line: Entity,
        readonly stop: Entity
    }[],
    arrivingVehicle?: VehicleData,
    arrivingVehicleDistance?: number,
    arrivingVehicleStops?: number,
};
export type VehicleData = {
    readonly entity: Entity,
    readonly position: number,
    readonly cargo: number,
    readonly capacity: number,
    readonly isCargo: boolean,
    readonly name: NameCustom | NameFormatted,
    normalizedPosition: number,
    distanceNextStop: number
    distancePrevStop: number
};
export type SegmentData = {
    readonly start: number,
    readonly end: number,
    readonly sizeMeters: number,
    readonly broken: boolean
}

export type LineDetails = {
    LineData: LineData,
    StopCapacity: number,
    Stops: StationData[]
    Vehicles: VehicleData[],
    Segments: SegmentData[]
}

export type MapViewerOptions = {
    showDistricts: boolean,
    showDistances: boolean,
    showVehicles: boolean,
    showIntegrations: boolean,
    useWhiteBackground: boolean
}

type State = {
    lineDetails?: LineDetails,
    mapViewOptions: MapViewerOptions
}

type Props = {
    currentLine: LineData,
    getLineById: (x: number) => LineData,
    setSelection: (x: Entity) => Promise<void>,
    onBack: () => void
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
        }
    }
    componentDidMount() {
        engine.whenReady.then(async () => {
            engine.on("k45::xtm.lineViewer.getRouteDetail->", (details: State['lineDetails']) => {
                if (details.LineData.entity.Index != this.props.currentLine.entity.Index) return;
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
            await engine.call("k45::xtm.lineViewer.getRouteDetail", this.props.currentLine.entity, force);
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
        const lineCommonData = lineDetails?.LineData;
        return <>
            <DefaultPanelScreen title={nameToString(this.props.currentLine.name)} subtitle="" buttonsRowContent={buttonsRow}>
                <TlmViewerCmp {...this.state.mapViewOptions} lineCommonData={lineCommonData} lineDetails={lineDetails} getLineById={(x) => this.props.getLineById(x)} setSelection={(x) => this.setSelection(x)} />
                <div className="lineViewContent">
                    <Tabs defaultIndex={3}>
                        <TabList id="sideNav">
                            <Tab>{translate("lineViewer.tabLineData")}</Tab>
                            <Tab disabled={true}>{translate("lineViewer.tabSettings")}</Tab>
                            <div className="space"></div>
                            <Tab>{translate("lineViewer.mapSettings")}</Tab>
                            <Tab disabled={true}>{translate("lineViewer.stopData")}</Tab>
                            <Tab disabled={true}>{translate("lineViewer.vehicleData")}</Tab>
                        </TabList>
                        <div id="dataPanel">
                            <TabPanel style={{ whiteSpace: 'pre-wrap' }}>

                                {JSON.stringify(this.state.lineDetails ?? "LOADING", null, 2)}
                            </TabPanel>
                            <TabPanel >
                                daçlkjdajdklasjd
                            </TabPanel>
                            <TabPanel>
                                <h2>{translate("lineViewer.showOnMap")}</h2>
                                <Checkbox isChecked={() => this.state.mapViewOptions.showDistances} title={translate("lineViewer.showDistancesLbl")} onValueToggle={(x) => this.toggleDistances(x)} />
                                <Checkbox isChecked={() => this.state.mapViewOptions.showDistricts} title={translate("lineViewer.showDistrictsLbl")} onValueToggle={(x) => this.toggleDistricts(x)} />
                                <Checkbox isChecked={() => this.state.mapViewOptions.showVehicles} title={translate("lineViewer.showVehiclesLbl")} onValueToggle={(x) => this.toggleVehiclesShow(x)} />
                                <Checkbox isChecked={() => this.state.mapViewOptions.showIntegrations} title={translate("lineViewer.showIntegrationsLbl")} onValueToggle={(x) => this.toggleIntegrations(x)} />
                                <Checkbox isChecked={() => this.state.mapViewOptions.useWhiteBackground} title={translate("lineViewer.useWhiteBackgroundLbl")} onValueToggle={(x) => this.toggleWhiteBG(x)} />
                            </TabPanel>
                            <TabPanel></TabPanel>
                            <TabPanel></TabPanel>
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

    async sendRouteName(lineData: LineData, newName: string) {
        const response: NameFormatted | NameCustom = await engine.call("k45::xtm.lineViewer.setRouteName", lineData.entity, newName)
        return nameToString(response);
    }

    async sendAcronym(entity: Entity, newAcronym: string) {
        try {
            const response = await engine.call("k45::xtm.lineViewer.setAcronym", entity, newAcronym)
            return response;
        } catch (e) {
            console.warn(e);
        }
    }
    async sendRouteNumber(lineData: LineData, newNumber: string) {
        const numberParsed = parseInt(newNumber);
        if (isFinite(numberParsed)) {
            const response: number = await engine.call("k45::xtm.lineViewer.setRouteNumber", lineData.entity, numberParsed)
            return response.toFixed();
        }
        return lineData.routeNumber?.toString();
    }
}


