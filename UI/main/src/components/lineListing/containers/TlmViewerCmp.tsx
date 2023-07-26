import { MeasureUnit } from "#utility/MeasureUnitsUtils";
import { nameToString } from "#utility/name.utils";
import translate from "#utility/translate";
import { CSSProperties, Component, ReactNode } from "react";
import { LineDetails, MapViewerOptions, StationData, VehicleData } from "../LineDetailCmp";
import { LineData } from "../LineListCmp";
import { ColorUtils } from "#utility/ColorUtils";
import { DistrictBorderContainerCmp } from "./DistrictBorderContainerCmp";
import { MapStationDistanceContainerCmp } from "./MapStationDistanceContainerCmp";
import { MapVehicleContainerCmp } from "./MapVehicleContainerCmp";
import { StationContainerCmp } from "./StationContainerCmp";
import { Entity } from "#utility/Entity";
import { TlmLineFormatCmp, getFontSizeForText } from "./TlmLineFormatCmp";
import { StationIntegrationContainerCmp } from "./StationIntegrationContainerCmp";


export class TlmViewerCmp extends Component<{
    lineDetails: LineDetails;
    lineCommonData: LineData;
    setSelection: (line: Entity) => void;
    getLineById: (line: number) => LineData;
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
                            <TlmLineFormatCmp lineCommonData={lineCommonData} />
                        </div>
                    </div>
                    <div className="lineStationsContainer">
                        <div className="linePath" style={{ "--lineColor": ColorUtils.getClampedColor(lineCommonData.color), height: 50 * (lineDetails.Stops.length + 1) } as CSSProperties}>
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
                                        />
                                    })}
                                    <StationContainerCmp
                                        station={lineDetails.Stops[0]}
                                        vehicles={lineDetails.Vehicles}
                                        keyId={-1}
                                        normalizedPosition={1}
                                        totalStationCount={lineDetails.Stops.length}
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
