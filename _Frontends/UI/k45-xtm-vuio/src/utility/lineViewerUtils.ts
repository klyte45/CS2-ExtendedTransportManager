import { StationData, VehicleData, LineData } from "#service/LineManagementService";
import { NameCustom, NameFormatted } from "@klyte45/vuio-commons";

export function enrichStopInfo(index: number, station: StationData, allStations: StationData[], vehicles: VehicleData[], lineData: LineData): Partial<StationData> {
    const arrivingVehicle = vehicles.length == 0 ? [] : vehicles.map(x => [x.position > station.position ? x.position - 1 : x.position, x] as [number, VehicleData]).sort((a, b) => b[0] - a[0])[0]

    return {
        arrivingVehicle: arrivingVehicle[1],
        arrivingVehicleDistance: arrivingVehicle ? (station.position - arrivingVehicle[0]) * lineData.length : undefined,
        arrivingVehicleStops: arrivingVehicle ? allStations.map(x => x.position >= station.position ? x.position - 1 : x.position).filter(x => x > arrivingVehicle[0]).length : undefined,
        index
    }
}
export function enrichVehicleInfo(vehicle: VehicleData, stations: StationData[], lineLength: number): Partial<VehicleData> {
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

export function getCrowdnessRatio(cargo: number, stopCapacity: number): number {
    if (!stopCapacity || stopCapacity <= 0) return 0;
    return cargo / stopCapacity;
}

export type CrowdnessBorderStyle = {
    borderWidthRem: number;
    borderColor: string;
    pulse: boolean;
    fillPercent: number;
};

export function getCrowdnessBorderStyle(ratio: number): CrowdnessBorderStyle {
    const fillPercent = Math.min(Math.max(ratio, 0), 1) * 100;
    let borderWidthRem = 1;
    if (ratio >= 0.5) {
        const t = Math.min((ratio - 0.5) / 0.5, 1);
        borderWidthRem = 1 + t * 3;
    }

    let borderColor = "black";
    if (ratio > 1) borderColor = "#FF0000";
    else if (ratio >= 0.9) borderColor = "#FF0044";
    else if (ratio >= 0.8) borderColor = "#FF00CC";
    else if (ratio >= 0.7) borderColor = "#8800FF";
    else if (ratio >= 0.6) borderColor = "#4400FF";
    else if (ratio >= 0.5) borderColor = "#333333";

    return {
        borderWidthRem,
        borderColor,
        pulse: ratio >= 0.75,
        fillPercent
    };
}

/** Return-direction stop mirrored around the half-trip midpoint; undefined for termini. */
export function findSymmetricPairStop(allStops: StationData[], halfTripIndex: number): StationData | undefined {
    const length = allStops.length;
    if (length < 2) return undefined;
    const mid = length / 2;
    if (halfTripIndex <= 0 || halfTripIndex >= mid) return undefined;
    return allStops[length - halfTripIndex];
}

export function isSymmetricMiddleStop(halfTripIndex: number, halfTripStopCount: number): boolean {
    return halfTripIndex > 0 && halfTripIndex < halfTripStopCount - 1;
}

export type TerminusNames = {
    outbound: NameCustom | NameFormatted;
    return: NameCustom | NameFormatted;
};

/** Outbound terminus = far end of half-trip; return terminus = start of line. */
export function getTerminusNames(allStops: StationData[]): TerminusNames | undefined {
    if (!allStops.length) return undefined;
    const mid = Math.floor(allStops.length / 2);
    return {
        outbound: allStops[mid].name,
        return: allStops[0].name
    };
}
