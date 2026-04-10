import { toEntityTyped, toVanillaEntity, VanillaComponentResolver } from "@klyte45/vuio-commons";
import { Entity, Name, selectedInfo } from "cs2/bindings"
import { useEffect, useState } from "react";
import { TlmViewerCmp } from "./lineViewer/TlmViewerCmp";
import { LineData, LineDetails, LineManagementService, MapViewerOptions, StationData, VehicleData } from "#service/LineManagementService";
import { TransportType } from "#enum/TransportType";
import engine from "cohtml/cohtml";
import "#styles/TLM_LineDetail.scss";

type Props = {
    children: React.ReactNode;
    args: VanillaLineInformation;
    isXtm: boolean;
    xtmOptions: MapViewerOptions;
};

const TypeToIcons = {
    [`${TransportType.Bus}.false`]: "assetdb://gameui/Media/Game/Icons/BusLine.svg",
    [`${TransportType.Tram}.false`]: "assetdb://gameui/Media/Game/Icons/TramLine.svg",
    [`${TransportType.Subway}.false`]: "assetdb://gameui/Media/Game/Icons/SubwayLine.svg",
    [`${TransportType.Train}.false`]: "assetdb://gameui/Media/Game/Icons/PassengerTrainLine.svg",
    [`${TransportType.Ship}.false`]: "assetdb://gameui/Media/Game/Icons/PassengerShipLine.svg",
    [`${TransportType.Ferry}.false`]: "assetdb://gameui/Media/Game/Icons/PassengerShipLine.svg",
    [`${TransportType.Airplane}.false`]: "assetdb://gameui/Media/Game/Icons/PassengerAirplaneLine.svg",
    [`${TransportType.Train}.true`]: "assetdb://gameui/Media/Game/Icons/CargoTrainLine.svg",
    [`${TransportType.Ship}.true`]: "assetdb://gameui/Media/Game/Icons/CargoShipLine.svg",
    [`${TransportType.Airplane}.true`]: "assetdb://gameui/Media/Game/Icons/CargoAirplaneLine.svg",
}

export const XtmLineViewer = ({ children, args, isXtm, xtmOptions }: Props) => {
    if (isXtm) {
        const currentLine = toEntityTyped(selectedInfo.selectedRoute$.value);
        const [indexedLineList, setIndexedLineList] = useState<Record<string, LineData>>({});

        const reloadLines = async (res: LineData[]) => {
            const refOrder = Object.keys(TypeToIcons);
            const lineList = res.sort((a, b) => {
                const typeA = `${a.type}.${a.isCargo}`
                const typeB = `${b.type}.${b.isCargo}`

                if (typeA != typeB) return refOrder.indexOf(typeA) - refOrder.indexOf(typeB);
                return a.routeNumber - b.routeNumber
            });
            setIndexedLineList(lineList.reduce((p, n) => {
                p[n.entity.Index.toFixed(0)] = n;
                return p;
            }, {} as Record<string, LineData>));
        }

        useEffect(() => {
            engine.whenReady.then(async () => {
                engine.on("k45::xtm.lineViewer.getCityLines->", async (x) => {
                    reloadLines(x);
                });
            })
            engine.call("k45::xtm.lineViewer.getCityLines", true)
            return () => {
                engine.off("k45::xtm.lineViewer.getCityLines->");
            }
        }, [])
        useEffect(() => {
            const updateCallback = setInterval(() => reloadData(false), 3000);
            reloadData(true);
            return () => clearInterval(updateCallback);
        }, [selectedInfo.selectedRoute$.value])

        const [lineDetails, setLineDetails] = useState<LineDetails>();
        const [isLineSimetric, setIsLineSimetric] = useState(false);

        async function reloadData(force: boolean) {
            if (force || xtmOptions.showVehicles) {
                const details = await LineManagementService.getRouteDetail(currentLine, true)
                if (details.LineData.entity.Index != currentLine.Index) return;
                details.Vehicles = details.Vehicles.map(x => {
                    return {
                        ...x,
                        ...enrichVehicleInfo(x, details.Stops, details.LineData.length)
                    }
                })
                details.Stops = details.Stops.map((x, i, arr) => {
                    return {
                        ...x,
                        ...enrichStopInfo(i, x, arr, details.Vehicles, details.LineData)
                    }
                })
                setLineDetails(details)

                setIsLineSimetric(LineManagementService.checkSimetry(details.Stops))
            }
        }
        if (!lineDetails) {
            reloadData(true);
        }
        if (lineDetails) {
            return <TlmViewerCmp
                lineDetails={lineDetails}
                showDistances={xtmOptions.showDistances}
                showIntegrations={xtmOptions.showIntegrations}
                useHalfTripIfSimetric={xtmOptions.useHalfTripIfSimetric}
                showDistricts={xtmOptions.showDistricts}
                showVehicles={xtmOptions.showVehicles}
                useWhiteBackground={xtmOptions.useWhiteBackground}
                getLineById={(x) => indexedLineList[x]}
                simetricLine={isLineSimetric}
            />
        }
        return <></>
    } else {
        return <>{children}</>;
    }
}

function enrichStopInfo(index: number, station: StationData, allStations: StationData[], vehicles: VehicleData[], lineData: LineData): Partial<StationData> {
    const arrivingVehicle = vehicles.length == 0 ? [] : vehicles.map(x => [x.position > station.position ? x.position - 1 : x.position, x] as [number, VehicleData]).sort((a, b) => b[0] - a[0])[0]

    return {
        arrivingVehicle: arrivingVehicle[1],
        arrivingVehicleDistance: arrivingVehicle ? (station.position - arrivingVehicle[0]) * lineData.length : undefined,
        arrivingVehicleStops: arrivingVehicle ? allStations.map(x => x.position >= station.position ? x.position - 1 : x.position).filter(x => x > arrivingVehicle[0]).length : undefined,
        index
    }
}
function enrichVehicleInfo(vehicle: VehicleData, stations: StationData[], lineLength: number): Partial<VehicleData> {
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

export interface VanillaLineInformation {
    width: number
    height: number
    stops: Stop[]
    focused: boolean
    group: string
    tooltipKeys: any[]
    tooltipTags: any[]
    color: Color
    vehicles: Vehicle[]
    segments: Segment[]
    stopCapacity: number
}

export interface Stop {
    entity: Entity
    name: Name
    position: number
    cargo: number
    capacity: number
    type: number
    isOutsideConnection: boolean
}


export interface Color {
    r: number
    g: number
    b: number
    a: number
}

export interface Vehicle {
    entity: Entity
    name: Name
    cargo: number
    capacity: number
    position: number
    type: number
}


export interface Segment {
    start: number
    end: number
    broken: boolean
}
