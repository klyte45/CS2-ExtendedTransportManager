import { LineData, LineDetails, MapViewerOptions, StationData } from "#service/LineManagementService";
import { CSSProperties } from "react";
import { DistrictBorderContainerCmp } from "./DistrictBorderContainerCmp";
import { MapStationDistanceContainerCmp } from "./MapStationDistanceContainerCmp";
import { MapVehicleContainerCmp } from "./MapVehicleContainerCmp";
import { StationContainerCmp } from "./StationContainerCmp";
import { StationIntegrationContainerCmp } from "./StationIntegrationContainerCmp";
import { TlmLineFormatCmp } from "./TlmLineFormatCmp";
import { ColorUtils, Entity } from "@klyte45/vuio-commons";
import { Scrollable, ScrollController } from "cs2/ui";

type Props = {
    lineDetails: LineDetails;
    setSelection: (line: Entity) => void;
    getLineById: (line: number) => LineData;
    onSelectStop: (entity: StationData) => void;
    simetricLine?: boolean;
    currentStopSelected?: StationData;
} & MapViewerOptions;

export function TlmViewerCmp({ lineDetails, setSelection, getLineById, onSelectStop, simetricLine, currentStopSelected, showDistricts, showDistances, showVehicles, showIntegrations, useWhiteBackground, useHalfTripIfSimetric }: Props) {

    const lineCommonData: LineData = lineDetails.LineData;
    const showSimetricMode = simetricLine && !showVehicles && useHalfTripIfSimetric;
    const targetStops = showSimetricMode ? lineDetails.Stops.slice(0, lineDetails.Stops.length / 2 + 1) : lineDetails.Stops;
    const targetLenght = targetStops.length - (showSimetricMode ? 1 : 0);

    return <div id="TlmViewer" className={useWhiteBackground ? "mapWhiteBg" : ""}>
        {!lineDetails ? <></> :
            <>
                <div>
                    <div className="titleRow">
                        <TlmLineFormatCmp {...lineCommonData} text={lineCommonData.xtmData?.Acronym || lineCommonData.routeNumber.toFixed()} />
                    </div>
                </div>
                <Scrollable className="lineStationsContainer">
                    <div className="linePath" style={{ "--lineColor": ColorUtils.getClampedColor(lineCommonData.color), height: (50 * (targetStops.length + 1)) + "rem" } as CSSProperties}>
                        <div className="lineBg"></div>
                        <div className="railingContainer">
                            {showIntegrations &&
                                <div className="integrationsRailing">
                                    {targetStops.map((station, i) => {
                                        return <StationIntegrationContainerCmp
                                            isFaded={currentStopSelected && currentStopSelected.entity.Index != station.entity.Index && (!simetricLine || currentStopSelected.parent.Index != station.parent.Index)}
                                            getLineById={(x) => getLineById(x)}
                                            setSelection={(x) => setSelection(x)}
                                            station={station}
                                            vehicles={lineDetails.Vehicles}
                                            keyId={i}
                                            key={i}
                                            normalizedPosition={i / targetLenght}
                                            totalStationCount={targetLenght}
                                            thisLineId={lineDetails.LineData.entity}
                                        />;
                                    })}
                                    {!showSimetricMode && <StationIntegrationContainerCmp
                                        isFaded={currentStopSelected && currentStopSelected.entity.Index != targetStops[0].entity.Index && (!simetricLine || currentStopSelected.parent.Index != targetStops[0].parent.Index)}
                                        thisLineId={lineDetails.LineData.entity}
                                        getLineById={(x) => getLineById(x)}
                                        setSelection={(x) => setSelection(x)}
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
                                        direction={currentStopSelected && showSimetricMode && currentStopSelected?.parent.Index == station.parent.Index ? currentStopSelected.index !== undefined && currentStopSelected.index < targetLenght ? 1 : -1 : 0}
                                        isFaded={currentStopSelected && currentStopSelected.entity.Index != station.entity.Index && (!showSimetricMode || currentStopSelected.parent.Index != station.parent.Index)}
                                        station={station}
                                        vehicles={lineDetails.Vehicles}
                                        keyId={i}
                                        key={i}
                                        normalizedPosition={i / targetLenght}
                                        totalStationCount={targetLenght}
                                        onSelectStop={(x) => onSelectStop(x)}
                                    />;
                                })}
                                {!showSimetricMode && <StationContainerCmp
                                    isFaded={currentStopSelected && currentStopSelected.entity.Index != targetStops[0].entity.Index && (!showSimetricMode || currentStopSelected.parent.Index != targetStops[0].parent.Index)}
                                    station={targetStops[0]}
                                    vehicles={lineDetails.Vehicles}
                                    keyId={-1}
                                    normalizedPosition={1}
                                    totalStationCount={targetLenght}
                                    onSelectStop={(x) => onSelectStop(x)}
                                />}
                            </div>
                            {showDistricts &&
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
                                                />;
                                            }
                                        }))}
                                </div>}
                            {showDistances &&
                                <div className="distanceRailing">{targetStops.map((station, i, arr) => {
                                    const nextIdx = (i + 1) % arr.length;
                                    if (showSimetricMode && nextIdx == 0) return;
                                    const nextStop = arr[nextIdx];
                                    return <MapStationDistanceContainerCmp key={i}
                                        stop={station}
                                        nextStop={nextStop}
                                        segments={lineDetails.Segments}
                                        normalizedPosition={(i + .5) / targetLenght}
                                    />;
                                })}
                                </div>
                            }
                            {showVehicles &&
                                <div className="vehiclesRailing">{lineDetails.Vehicles.map((vehicle, i) => {
                                    return <MapVehicleContainerCmp key={i} vehicle={vehicle} />;
                                })}
                                </div>
                            }
                        </div>
                    </div>
                </Scrollable>
            </>
        }
    </div>;
}

