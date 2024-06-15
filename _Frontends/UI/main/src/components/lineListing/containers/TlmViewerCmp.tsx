import { LineData, LineDetails, MapViewerOptions, StationData } from "#service/LineManagementService";
import { ColorUtils } from "@klyte45/euis-components";
import { Entity } from "@klyte45/euis-components";
import { CSSProperties, Component, ReactNode } from "react";
import { DistrictBorderContainerCmp } from "./DistrictBorderContainerCmp";
import { MapStationDistanceContainerCmp } from "./MapStationDistanceContainerCmp";
import { MapVehicleContainerCmp } from "./MapVehicleContainerCmp";
import { StationContainerCmp } from "./StationContainerCmp";
import { StationIntegrationContainerCmp } from "./StationIntegrationContainerCmp";
import { TlmLineFormatCmp } from "./TlmLineFormatCmp";


export class TlmViewerCmp extends Component<{
    lineDetails: LineDetails;
    lineCommonData: LineData;
    setSelection: (line: Entity) => void;
    getLineById: (line: number) => LineData;
    onSelectStop: (entity: StationData) => void
    simetricLine?: boolean
} & MapViewerOptions> {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render(): ReactNode {
        const lineDetails = this.props.lineDetails;
        const lineCommonData = this.props.lineCommonData;
        const showSimetricMode = this.props.simetricLine && !this.props.showVehicles && this.props.useHalfTripIfSimetric;

        const targetStops = showSimetricMode ? lineDetails.Stops.slice(0, lineDetails.Stops.length / 2 + 1) : lineDetails.Stops
        const targetLenght = targetStops.length - (showSimetricMode ? 1 : 0)

        return <div id="TlmViewer" className={this.props.useWhiteBackground ? "mapWhiteBg" : ""}>
            {!lineDetails ? <></> :
                <>
                    <div>
                        <div className="titleRow">
                            <TlmLineFormatCmp  {...lineCommonData} text={lineCommonData.xtmData?.Acronym || lineCommonData.routeNumber.toFixed()} />
                        </div>
                    </div>
                    <div className="lineStationsContainer">
                        <div className="linePath" style={{ "--lineColor": ColorUtils.getClampedColor(lineCommonData.color), height: (50 * (targetStops.length + 1)) + "rem" } as CSSProperties}>
                            <div className="lineBg"></div>
                            <div className="railingContainer">
                                {this.props.showIntegrations &&
                                    <div className="integrationsRailing">
                                        {targetStops.map((station, i) => {
                                            return <StationIntegrationContainerCmp
                                                getLineById={(x) => this.props.getLineById(x)}
                                                setSelection={(x) => this.props.setSelection(x)}
                                                station={station}
                                                vehicles={lineDetails.Vehicles}
                                                keyId={i}
                                                key={i}
                                                normalizedPosition={i / targetLenght}
                                                totalStationCount={targetLenght}
                                                thisLineId={lineDetails.LineData.entity}
                                            />
                                        })}
                                        {!showSimetricMode && <StationIntegrationContainerCmp
                                            thisLineId={lineDetails.LineData.entity}
                                            getLineById={(x) => this.props.getLineById(x)}
                                            setSelection={(x) => this.props.setSelection(x)}
                                            station={targetStops[0]}
                                            vehicles={lineDetails.Vehicles}
                                            keyId={-1}
                                            normalizedPosition={1}
                                            totalStationCount={targetStops.length}
                                        />}
                                    </div>}
                                <div className="stationRailing">
                                    {targetStops.map((station, i) => {
                                        return <StationContainerCmp
                                            station={station}
                                            vehicles={lineDetails.Vehicles}
                                            keyId={i}
                                            key={i}
                                            normalizedPosition={i / targetLenght}
                                            totalStationCount={targetLenght}
                                            onSelectStop={(x) => this.props.onSelectStop(x)}
                                        />
                                    })}
                                    {!showSimetricMode && <StationContainerCmp
                                        station={targetStops[0]}
                                        vehicles={lineDetails.Vehicles}
                                        keyId={-1}
                                        normalizedPosition={1}
                                        totalStationCount={targetLenght}
                                        onSelectStop={(x) => this.props.onSelectStop(x)}
                                    />}
                                </div>
                                {this.props.showDistricts &&
                                    <div className="districtRailing">{(
                                        targetStops.every(x => !x.isOutsideConnection && x.district.Index == targetStops[0].district.Index) ?
                                            <>
                                                <DistrictBorderContainerCmp
                                                    stop={targetStops[0]}
                                                    nextStop={targetStops[0]}
                                                    normalizedPosition={0}
                                                    totalStationCount={targetLenght}
                                                    newOnly={true}
                                                />
                                                <DistrictBorderContainerCmp
                                                    stop={targetStops[0]}
                                                    nextStop={targetStops[0]}
                                                    normalizedPosition={2}
                                                    totalStationCount={targetLenght}
                                                    oldOnly={true}
                                                />
                                            </>
                                            : targetStops.map((station, i, arr) => {
                                                const nextIdx = (i + 1) % arr.length;
                                                if (showSimetricMode && nextIdx == 0) return;
                                                const nextStop = arr[nextIdx];
                                                if (station.isOutsideConnection || nextStop.isOutsideConnection || nextStop.district.Index != station.district.Index) {
                                                    return <DistrictBorderContainerCmp
                                                        stop={station}
                                                        nextStop={nextStop}
                                                        key={i}
                                                        normalizedPosition={(i + 1) / targetLenght}
                                                        totalStationCount={targetLenght}
                                                    />
                                                }
                                            }))}
                                    </div>}
                                {this.props.showDistances &&
                                    <div className="distanceRailing">{targetStops.map((station, i, arr) => {
                                        const nextIdx = (i + 1) % arr.length;
                                        if (showSimetricMode && nextIdx == 0) return;
                                        const nextStop = arr[nextIdx];
                                        return <MapStationDistanceContainerCmp key={i}
                                            stop={station}
                                            nextStop={nextStop}
                                            segments={lineDetails.Segments}
                                            normalizedPosition={(i + .5) / (targetLenght)} />
                                    })}
                                    </div>
                                }
                                {this.props.showVehicles &&
                                    <div className="vehiclesRailing">{lineDetails.Vehicles.map((vehicle, i) => {
                                        return <MapVehicleContainerCmp key={i} vehicle={vehicle} />
                                    })}
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </>
            }
        </div>;
    }
}

