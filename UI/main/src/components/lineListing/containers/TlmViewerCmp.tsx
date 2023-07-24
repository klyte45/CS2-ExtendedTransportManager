import { MeasureUnit } from "#utility/MeasureUnitsUtils";
import { nameToString } from "#utility/name.utils";
import translate from "#utility/translate";
import { CSSProperties, Component, ReactNode } from "react";
import { LineDetails, MapViewerOptions, StationData, VehicleData, getFontSizeForText } from "../LineDetailCmp";
import { LineData } from "../LineListCmp";
import { ColorUtils } from "#utility/ColorUtils";
import { DistrictBorderContainerCmp } from "./DistrictBorderContainerCmp";
import { MapStationDistanceContainerCmp } from "./MapStationDistanceContainerCmp";
import { MapVehicleContainerCmp } from "./MapVehicleContainerCmp";
import { StationContainerCmp } from "./StationContainerCmp";
import { Entity } from "#utility/Entity";


export class TlmViewerCmp extends Component<{
    lineDetails: LineDetails;
    lineCommonData: LineData;
    setSelection: (line: Entity) => void;
    getLineById: (line: Entity) => LineData;
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
                            <div className="formatContainer">
                                <div style={{ "--currentBgColor": getClampedColor(lineCommonData.color) } as CSSProperties} className={`format ${lineCommonData.type} v???`}>
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
                                            getLineById={(x) => this.props.getLineById(x)}
                                            lineData={lineCommonData}
                                            setSelection={(x) => this.props.setSelection(x)}
                                            station={station}
                                            vehicles={lineDetails.Vehicles}
                                            keyId={i}
                                            key={i}
                                            normalizedPosition={i / arr.length}
                                            totalStationCount={arr.length}
                                        />
                                    })}
                                    <StationContainerCmp
                                        getLineById={(x) => this.props.getLineById(x)}
                                        lineData={lineCommonData}
                                        setSelection={(x) => this.props.setSelection(x)}
                                        station={lineDetails.Stops[0]}
                                        vehicles={lineDetails.Vehicles}
                                        keyId={-1}
                                        normalizedPosition={1}
                                        totalStationCount={lineDetails.Stops.length}
                                    />
                                </div>
                                <div className="districtRailing">
                                    {this.props.showDistricts && (
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
                                </div>
                                <div className="distanceRailing">
                                    {this.props.showDistances && lineDetails.Stops.map((station, i, arr) => {
                                        const nextIdx = (i + 1) % arr.length;
                                        const nextStop = arr[nextIdx];
                                        return <MapStationDistanceContainerCmp key={i}
                                            stop={station}
                                            nextStop={nextStop}
                                            segments={lineDetails.Segments}
                                            normalizedPosition={(i + .5) / (arr.length)} />
                                    })}
                                </div>
                                <div className="vehiclesRailing">
                                    {this.props.showVehicles && lineDetails.Vehicles.map((vehicle, i) => {
                                        return <MapVehicleContainerCmp key={i} vehicle={vehicle} />
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            }
        </div>;
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