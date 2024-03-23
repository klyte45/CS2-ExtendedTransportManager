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
} & MapViewerOptions> {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render(): ReactNode {
        const lineDetails = this.props.lineDetails;
        const lineCommonData = this.props.lineCommonData;
        return <div id="TlmViewer" className={this.props.useWhiteBackground ? "mapWhiteBg" : ""}>
            {!lineDetails ? <></> :
                <>
                    <div>
                        <div className="titleRow">
                            <TlmLineFormatCmp  {...lineCommonData} text={lineCommonData.xtmData?.Acronym || lineCommonData.routeNumber.toFixed()}  />
                        </div>
                    </div>
                    <div className="lineStationsContainer">
                        <div className="linePath" style={{ "--lineColor": ColorUtils.getClampedColor(lineCommonData.color), height: (50 * (lineDetails.Stops.length + 1)) + "rem" } as CSSProperties}>
                            <div className="lineBg"></div>
                            <div className="railingContainer">
                                {this.props.showIntegrations &&
                                    <div className="integrationsRailing">
                                        {lineDetails.Stops.map((station, i, arr) => {
                                            return <StationIntegrationContainerCmp
                                                getLineById={(x) => this.props.getLineById(x)}
                                                setSelection={(x) => this.props.setSelection(x)}
                                                station={station}
                                                vehicles={lineDetails.Vehicles}
                                                keyId={i}
                                                key={i}
                                                normalizedPosition={i / arr.length}
                                                totalStationCount={arr.length}
                                                thisLineId={lineDetails.LineData.entity}
                                            />
                                        })}
                                        <StationIntegrationContainerCmp
                                            thisLineId={lineDetails.LineData.entity}
                                            getLineById={(x) => this.props.getLineById(x)}
                                            setSelection={(x) => this.props.setSelection(x)}
                                            station={lineDetails.Stops[0]}
                                            vehicles={lineDetails.Vehicles}
                                            keyId={-1}
                                            normalizedPosition={1}
                                            totalStationCount={lineDetails.Stops.length}
                                        />
                                    </div>}
                                <div className="stationRailing">
                                    {lineDetails.Stops.map((station, i, arr) => {
                                        return <StationContainerCmp
                                            station={station}
                                            vehicles={lineDetails.Vehicles}
                                            keyId={i}
                                            key={i}
                                            normalizedPosition={i / arr.length}
                                            totalStationCount={arr.length}
                                            onSelectStop={(x) => this.props.onSelectStop(x)}
                                        />
                                    })}
                                    <StationContainerCmp
                                        station={lineDetails.Stops[0]}
                                        vehicles={lineDetails.Vehicles}
                                        keyId={-1}
                                        normalizedPosition={1}
                                        totalStationCount={lineDetails.Stops.length}
                                        onSelectStop={(x) => this.props.onSelectStop(x)}
                                    />
                                </div>
                                {this.props.showDistricts &&
                                    <div className="districtRailing">{(
                                        lineDetails.Stops.every(x => !x.isOutsideConnection && x.district.Index == lineDetails.Stops[0].district.Index) ?
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
                                                    nextStop={lineDetails.Stops[0]}
                                                    normalizedPosition={2}
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
                                            }))}
                                    </div>}
                                {this.props.showDistances &&
                                    <div className="distanceRailing">{lineDetails.Stops.map((station, i, arr) => {
                                        const nextIdx = (i + 1) % arr.length;
                                        const nextStop = arr[nextIdx];
                                        return <MapStationDistanceContainerCmp key={i}
                                            stop={station}
                                            nextStop={nextStop}
                                            segments={lineDetails.Segments}
                                            normalizedPosition={(i + .5) / (arr.length)} />
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

