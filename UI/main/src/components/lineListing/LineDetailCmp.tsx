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
type State = {
    lineDetails?: {
        LineData: LineData,
        StopCapacity: number,
        Stops: StationData[]
        Vehicles: VehicleData[],
        Segments: SegmentData[]
    }
}

type Props = {
    currentLine: LineData,
    onBack: () => void
}

export default class LineDetailCmp extends Component<Props, State> {
    constructor(props: any) {
        super(props);
        this.state = {
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
                this.setState({ lineDetails: details });
                this.reloadLines();
            });
        })
        this.reloadLines(true);
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
        const lastStationIdx = stations.filter(x => x.position < vehicle.position).length % stations.length;
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

    async reloadLines(force: boolean = false) {
        await engine.call("k45::xtm.lineViewer.getRouteDetail", this.props.currentLine.entity, force);
    }
    render() {
        if (!this.props.currentLine) {
            return <>INVALID</>
        }
        const buttonsRow = <>
            <button className="negativeBtn " onClick={this.props.onBack}>{translate("paletteEditor.cancel")}</button>
        </>
        const lineDetails = this.state.lineDetails;
        const lineCommonData = lineDetails?.LineData;
        return <>
            <DefaultPanelScreen title={nameToString(this.props.currentLine.name)} subtitle="" buttonsRowContent={buttonsRow}>
                <div id="TlmViewer">
                    {!lineDetails ? <></> :
                        <>
                            <div className=" container-fluid  pt-3">
                                <div className="titleRow">
                                    <div className="formatContainer">
                                        <div style={{ "--currentBgColor": lineCommonData.color } as CSSProperties} className={`format ${lineCommonData.type} v???`}>
                                            <div className="before"></div>
                                            <div className="after"></div>
                                        </div>
                                        <div style={{
                                            fontSize: getFontSizeForText(lineCommonData.xtmData?.Acronym || lineCommonData.routeNumber.toFixed()),
                                            color: ColorUtils.toRGBA(ColorUtils.getContrastColorFor(ColorUtils.toColor01(lineCommonData.color)))
                                        }} className="num">
                                            {lineCommonData.xtmData?.Acronym || (lineCommonData.routeNumber.toFixed())}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="lineStationsContainer">
                                <div className="linePath" style={{ "--lineColor": getClampedColor(lineCommonData.color), height: 40 * (lineDetails.Stops.length + 1) } as CSSProperties}>
                                    <div className="lineBg"></div>
                                    <div className="railingContainer">
                                        <div className="stationRailing">
                                            {lineDetails.Stops.map((station, i, arr) => {
                                                return <StationContainerCmp
                                                    getLineById={(x) => this.getLineById(x)}
                                                    lineData={lineCommonData}
                                                    setSelection={(x) => this.setSelection(x)}
                                                    station={station}
                                                    vehicles={lineDetails.Vehicles}
                                                    keyId={i}
                                                    key={i}
                                                    normalizedPosition={i / arr.length}
                                                    totalStationCount={arr.length}
                                                />
                                            })}
                                            <StationContainerCmp
                                                getLineById={(x) => this.getLineById(x)}
                                                lineData={lineCommonData}
                                                setSelection={(x) => this.setSelection(x)}
                                                station={lineDetails.Stops[0]}
                                                vehicles={lineDetails.Vehicles}
                                                keyId={-1}
                                                normalizedPosition={1}
                                                totalStationCount={lineDetails.Stops.length}
                                            />
                                        </div>
                                        <div className="districtRailing">
                                            {lineDetails.Stops.every(x => !x.isOutsideConnection && x.district.Index == lineDetails.Stops[0].district.Index) ?
                                                <>
                                                    <DistrictBorderContainerCmp
                                                        stop={lineDetails.Stops[0]}
                                                        nextStop={lineDetails.Stops[0]}
                                                        normalizedPosition={0}
                                                        totalStationCount={lineDetails.Stops.length}
                                                        newOnly={true}
                                                    />
                                                    <DistrictBorderContainerCmp
                                                        stop={lineDetails.Stops[0]}
                                                        normalizedPosition={2}
                                                        nextStop={lineDetails.Stops[0]}
                                                        totalStationCount={lineDetails.Stops.length}
                                                        oldOnly={true}
                                                    />
                                                </>
                                                : lineDetails.Stops.map((station, i, arr) => {
                                                    const nextIdx = (i + 1) % arr.length;
                                                    const nextStop = arr[nextIdx];
                                                    if (station.isOutsideConnection || nextStop.isOutsideConnection || nextStop.district.Index != station.district.Index) {
                                                        return <DistrictBorderContainerCmp
                                                            stop={station}
                                                            nextStop={nextStop}
                                                            key={i}
                                                            normalizedPosition={(i + 1) / arr.length}
                                                            totalStationCount={lineDetails.Stops.length}
                                                        />
                                                    }
                                                })}
                                        </div>
                                        <div className="distanceRailing">
                                            {lineDetails.Stops.map((station, i, arr) => {
                                                const nextIdx = (i + 1) % arr.length;
                                                const nextStop = arr[nextIdx];
                                                return <MapStationDistanceContainerCmp key={i}
                                                    stop={station}
                                                    nextStop={nextStop}
                                                    segments={this.state.lineDetails.Segments}
                                                    normalizedPosition={(i + .5) / (arr.length)} />
                                            })}
                                        </div>
                                        <div className="vehiclesRailing">
                                            {lineDetails.Vehicles.map((vehicle, i) => {
                                                return <MapVehicleContainerCmp key={i} vehicle={vehicle} />
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    }
                </div>
                <div id="dataPanel" style={{ whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(this.state.lineDetails ?? "LOADING", null, 2)}
                </div>
            </DefaultPanelScreen>
        </>;
    }
    getLineById(lineId: Entity): LineData {
        return {} as any
    }
    setSelection(lineId: Entity): void {
        return {} as any
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

export function getFontSizeForText(text: string) {
    switch (Math.max(...(text || "").split(" ").map(x => x.length))) {
        case 1:
            return "52px";
        case 2:
            return "44px";
        case 3:
            return "32px";
        case 4:
            return "22px";
        case 5:
            return "18px";
        case 6:
            return "15px";
        default:
            return "11px";
    }
}
function colorHexToRGB(color: string) {

    let r = parseInt(color.substring(1, 3), 16);
    let g = parseInt(color.substring(3, 5), 16);
    let b = parseInt(color.substring(5, 7), 16);
    return [r, g, b];
}

function getClampedColor(color: string) {
    var colorRgb = colorHexToRGB(color);
    return 'rgb(' + Math.min(colorRgb[0], 232) + "," + Math.min(colorRgb[1], 232) + "," + Math.min(colorRgb[2], 232) + ")";
}

