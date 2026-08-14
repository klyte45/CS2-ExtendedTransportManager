import { TransportType } from "#enum/TransportType";
import { Entity, NameCustom, NameFormatted, NameLocalized } from "@klyte45/vuio-commons";
import engine from "cohtml/cohtml";

export type LineData = {
    __Type: string,
    name: NameCustom | NameFormatted,
    vkName: NameLocalized,
    entity: Entity,
    color: string
    cargo: number,
    active: boolean,
    visible: boolean,
    isCargo: boolean,
    length: number,
    schedule: number,
    stops: number,
    type: TransportType,
    usage: number,
    /** Min non-stale historical occupancy (0–1) across stops/buckets. */
    usageMin: number,
    /** Max non-stale historical occupancy (0–1) across stops/buckets. */
    usageMax: number,
    vehicles: number,
    xtmData?: {
        Acronym: string
    }
    routeNumber: number,
    isFixedColor: boolean
}

export type StationData = {
    readonly entity: Entity,
    readonly waypoint: Entity,
    readonly position: number,
    readonly cargo: number,
    readonly isCargo: boolean,
    readonly isOutsideConnection: boolean,
    readonly name: NameCustom | NameFormatted,
    readonly parent: Entity,
    readonly parentName: NameCustom | NameFormatted | NameLocalized,
    readonly district: Entity,
    readonly districtName: NameCustom | NameFormatted,
    readonly connectedLines: {
        readonly line: Entity,
        readonly stop: Entity
    }[],
    readonly worldPosition: { x: number, y: number, z: number },
    readonly azimuth: number,
    /** Effective historical usage ratios (0–1) per 4h bucket; stale buckets are 0. */
    readonly usage00_04: number,
    readonly usage04_08: number,
    readonly usage08_12: number,
    readonly usage12_16: number,
    readonly usage16_20: number,
    readonly usage20_00: number,
    /** True when last sample for the bucket is older than yesterday (set in LineDetailDataJob). */
    readonly usage00_04_stale: boolean,
    readonly usage04_08_stale: boolean,
    readonly usage08_12_stale: boolean,
    readonly usage12_16_stale: boolean,
    readonly usage16_20_stale: boolean,
    readonly usage20_00_stale: boolean,
    arrivingVehicle?: VehicleData,
    arrivingVehicleDistance?: number,
    arrivingVehicleStops?: number,
    index?: number
};
export type VehicleData = {
    readonly entity: Entity,
    readonly position: number,
    readonly cargo: number,
    readonly capacity: number,
    readonly isCargo: boolean,
    readonly name: NameCustom | NameFormatted,
    readonly worldPosition: { x: number, y: number, z: number },
    readonly azimuth: number,
    readonly odometer: number,
    readonly maintenanceRange: number,
    normalizedPosition: number,
    distanceNextStop: number
    distancePrevStop: number
};
export type SegmentData = {
    readonly start: number,
    readonly end: number,
    readonly sizeMeters: number,
    readonly broken: boolean
    readonly duration: number
}

export type VehicleModel = {
    entity: Entity,
    isSecondary: boolean
}

export type LineDetails = {
    LineData: LineData,
    StopCapacity: number,
    Stops: StationData[]
    Vehicles: VehicleData[],
    Segments: SegmentData[],
    SelectedVehicleModels: VehicleModel[],
    AvailableVehicleModels: VehicleModel[]
}

export type SegmentOccupancyDisplayMode =
    | "none"
    | "currentHour"
    | "dayAverage"
    | "00_04"
    | "04_08"
    | "08_12"
    | "12_16"
    | "16_20"
    | "20_24";

export const SEGMENT_OCCUPANCY_DISPLAY_MODES: SegmentOccupancyDisplayMode[] = [
    "none",
    "currentHour",
    "dayAverage",
    "00_04",
    "04_08",
    "08_12",
    "12_16",
    "16_20",
    "20_24",
];

export type MapViewerOptions = {
    showDistricts: boolean,
    showDistances: boolean,
    showVehicles: boolean,
    showIntegrations: boolean,
    useWhiteBackground: boolean,
    useHalfTripIfSimetric: boolean,
    showPlatformCrowdness: boolean,
    /** Which segment occupancy value is shown on the linear map. */
    segmentOccupancyDisplay: SegmentOccupancyDisplayMode,
}

export class LineManagementService {
    static async listLines(): Promise<LineData[]> { return await engine.call("k45::xtm.lineViewer.getCityLines"); }
    /** Cheap existence check for UI gating; falls back to true so modes stay reachable on failure. */
    static async cityHasLines(): Promise<boolean> {
        try {
            return !!(await engine.call("k45::xtm.lineViewer.cityHasLines"));
        } catch {
            return true;
        }
    }
    static async getUseXtmLineListingDefault(): Promise<boolean> {
        try {
            return !!(await engine.call("k45::xtm.settings.getUseXtmLineListingDefault"));
        } catch {
            return true;
        }
    }
    static async getCurrentLineInfo(): Promise<LineDetails> { return await engine.call("k45::xtm.xtmInfoPanel.getCurrentLineInfo"); }

    static async setRouteFixedColor(entity: Entity, x: string): Promise<`#${string}`> { return await engine.call("k45::xtm.lineManagement.setRouteFixedColor", entity, x); }
    static async setIgnorePalette(entity: Entity, x: boolean): Promise<boolean> { return await engine.call("k45::xtm.lineManagement.setIgnorePalette", entity, x); }
    static async setRouteAcronym(entity: Entity, x: string): Promise<string> { return await engine.call("k45::xtm.lineManagement.setRouteAcronym", entity, x); }
    static async setRouteNumber(entity: Entity, x: number): Promise<string> { return await engine.call("k45::xtm.lineManagement.setRouteNumber", entity, x); }
    static async setFirstStop(route: Entity, stop: number): Promise<NameFormatted | NameCustom> { return await engine.call("k45::xtm.lineManagement.setFirstStop", route, stop); }

    static async getRouteAcronym(entity: Entity): Promise<`#${string}`> { return await engine.call("k45::xtm.lineManagement.getRouteAcronym", entity); }
    static async getRouteNumber(entity: Entity): Promise<number> { return await engine.call("k45::xtm.lineManagement.getRouteNumber", entity); }
    static async getIgnorePalette(entity: Entity): Promise<boolean> { return await engine.call("k45::xtm.lineManagement.getIgnorePalette", entity); }
    static async getRouteFixedColor(entity: Entity): Promise<`#${string}`> { return await engine.call("k45::xtm.lineManagement.getRouteFixedColor", entity); }

    static checkSimetry(stops: StationData[]): boolean {
        const length = stops.length;
        if (length % 1 == 1) return false;
        const otherSideIdx = stops.length / 2 + 1
        for (let i = 1; i < otherSideIdx; i++) {
            if (!stops[i] || !stops[length - i]) continue;
            if (!stops[i].parent.Index || stops[i].parent.Index != stops[length - i].parent.Index) return false;
        }
        return true;
    }
}