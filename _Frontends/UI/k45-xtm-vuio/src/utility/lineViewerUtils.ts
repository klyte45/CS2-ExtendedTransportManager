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

/** Effective historical occupancy (0–1) for the 4h bucket containing `hour` (0–23). */
export function getStopHistoricalUsageForHour(stop: StationData, hour: number): number {
    const h = ((Math.floor(hour) % 24) + 24) % 24;
    switch (Math.floor(h / 4)) {
        case 0: return stop.usage00_04 ?? 0;
        case 1: return stop.usage04_08 ?? 0;
        case 2: return stop.usage08_12 ?? 0;
        case 3: return stop.usage12_16 ?? 0;
        case 4: return stop.usage16_20 ?? 0;
        default: return stop.usage20_00 ?? 0;
    }
}

/** Inclusive start hour and exclusive end hour (0–24) for the 4h bucket containing `hour`. */
export function getHistoricalUsageHourRange(hour: number): { startHour: number; endHour: number } {
    const h = ((Math.floor(hour) % 24) + 24) % 24;
    const startHour = Math.floor(h / 4) * 4;
    return { startHour, endHour: startHour + 4 };
}

/** Six 4h usage ratios (0–1) in day order. */
export function getStopHistoricalUsageBuckets(stop: StationData): number[] {
    return [
        stop.usage00_04 ?? 0,
        stop.usage04_08 ?? 0,
        stop.usage08_12 ?? 0,
        stop.usage12_16 ?? 0,
        stop.usage16_20 ?? 0,
        stop.usage20_00 ?? 0,
    ];
}

/** Six stale flags matching getStopHistoricalUsageBuckets order. */
export function getStopHistoricalUsageStaleFlags(stop: StationData): boolean[] {
    return [
        !!stop.usage00_04_stale,
        !!stop.usage04_08_stale,
        !!stop.usage08_12_stale,
        !!stop.usage12_16_stale,
        !!stop.usage16_20_stale,
        !!stop.usage20_00_stale,
    ];
}

/**
 * Chart series for a full day: 6 points (one per 4h bucket).
 * Stale buckets become null so the line gaps.
 */
export function getStopHistoricalUsageSeries(stop: StationData): (number | null)[] {
    const values = getStopHistoricalUsageBuckets(stop);
    const stale = getStopHistoricalUsageStaleFlags(stop);
    return values.map((v, i) => (stale[i] ? null : v));
}

/** Mean of non-stale buckets (0–1). Returns 0 when no recorded buckets. */
export function getStopHistoricalUsageDayAverage(stop: StationData): number {
    const values = getStopHistoricalUsageBuckets(stop);
    const stale = getStopHistoricalUsageStaleFlags(stop);
    let sum = 0;
    let count = 0;
    for (let i = 0; i < values.length; i++) {
        if (!stale[i]) {
            sum += values[i];
            count++;
        }
    }
    return count > 0 ? sum / count : 0;
}

/** Return-direction stop mirrored around the half-trip midpoint; undefined for termini. */
export function findSymmetricPairStop(allStops: StationData[], halfTripIndex: number): StationData | undefined {
    const length = allStops.length;
    if (length < 2) return undefined;
    const mid = length / 2;
    if (halfTripIndex <= 0 || halfTripIndex >= mid) return undefined;
    return allStops[length - halfTripIndex];
}

/**
 * Return-direction "previous" stop for the corridor segment ending at half-trip index `nextHalfIndex`.
 * At the outbound terminus, the terminus itself is the return departure.
 */
export function findSymmetricReturnPreviousStop(
    allStops: StationData[],
    nextHalfIndex: number,
    nextStop: StationData,
): StationData {
    return findSymmetricPairStop(allStops, nextHalfIndex) ?? nextStop;
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
