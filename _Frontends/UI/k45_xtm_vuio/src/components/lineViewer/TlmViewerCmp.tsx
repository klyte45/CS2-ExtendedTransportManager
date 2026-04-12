import { LineData, LineDetails, MapViewerOptions, StationData } from "#service/LineManagementService";
import { CSSProperties } from "react";
import { DistrictBorderContainerCmp } from "./DistrictBorderContainerCmp";
import { MapStationDistanceContainerCmp } from "./MapStationDistanceContainerCmp";
import { MapVehicleContainerCmp } from "./MapVehicleContainerCmp";
import { StationContainerCmp } from "./StationContainerCmp";
import { StationIntegrationContainerCmp } from "./StationIntegrationContainerCmp";
import { TlmLineFormatCmp } from "./TlmLineFormatCmp";
import { ColorUtils, Entity, toVanillaEntity } from "@klyte45/vuio-commons";
import { Scrollable, ScrollController } from "cs2/ui";
import { selectedInfo } from "cs2/bindings";
import { useValue } from "cs2/api";

type Props = {
    lineDetails: LineDetails;
    getLineById: (line: number) => LineData;
    simetricLine?: boolean;
} & MapViewerOptions;

export function TlmViewerCmp({ lineDetails, getLineById, simetricLine, showDistricts, showDistances, showVehicles, showIntegrations, useWhiteBackground, useHalfTripIfSimetric }: Props) {

    const lineCommonData: LineData = lineDetails.LineData;
    const showSimetricMode = simetricLine && !showVehicles && useHalfTripIfSimetric;
    const targetStops = showSimetricMode ? lineDetails.Stops.slice(0, lineDetails.Stops.length / 2 + 1) : lineDetails.Stops;
    const targetLenght = targetStops.length - (showSimetricMode ? 1 : 0);
    const selectedEntity = useValue(selectedInfo.selectedEntity$);
    const currentStopSelected = selectedEntity ? lineDetails.Stops.find(x => x.entity.Index == selectedEntity.index) : undefined;

    return <div id="TlmViewer" className={useWhiteBackground ? "mapWhiteBg" : ""}>
        {!lineDetails ? <></> :
            <>
                <div>
                    <div className="titleRow" >
                        <TlmLineFormatCmp {...lineCommonData} text={lineCommonData.xtmData?.Acronym || lineCommonData.routeNumber.toFixed()} onClick={() => selectedInfo.selectEntity(toVanillaEntity(lineCommonData.entity))} />
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
                                            isFaded={selectedEntity.index != lineDetails.LineData.entity.Index && ![station.entity.Index, station.parent.Index].includes(showSimetricMode ? currentStopSelected?.parent.Index! : selectedEntity.index)}
                                            getLineById={(x) => getLineById(x)}
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
                                        isFaded={![targetStops[0].entity.Index, targetStops[0].parent.Index, lineDetails.LineData.entity.Index].includes(selectedEntity.index)}
                                        thisLineId={lineDetails.LineData.entity}
                                        getLineById={(x) => getLineById(x)}
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
                                        isFaded={selectedEntity.index != lineDetails.LineData.entity.Index && ![station.entity.Index, station.parent.Index].includes(showSimetricMode ? currentStopSelected?.parent.Index! : selectedEntity.index)}
                                        station={station}
                                        vehicles={lineDetails.Vehicles}
                                        keyId={i}
                                        key={i}
                                        normalizedPosition={i / targetLenght}
                                        totalStationCount={targetLenght}
                                        direction={currentStopSelected && showSimetricMode && !showVehicles && currentStopSelected?.parent.Index == station.parent.Index ? currentStopSelected?.index! < targetLenght ? 1 : -1 : 0}
                                    />;
                                })}
                                {!showSimetricMode && <StationContainerCmp
                                    isFaded={![targetStops[0].entity.Index, targetStops[0].parent.Index, lineDetails.LineData.entity.Index].includes(selectedEntity.index)}
                                    station={targetStops[0]}
                                    vehicles={lineDetails.Vehicles}
                                    keyId={-1}
                                    normalizedPosition={1}
                                    totalStationCount={targetLenght}
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
                                    return <MapVehicleContainerCmp
                                        key={i} vehicle={vehicle}
                                        isFaded={![vehicle.entity.Index, lineDetails.LineData.entity.Index].includes(selectedEntity.index)}
                                    />;
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

