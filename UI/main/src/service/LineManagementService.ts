import { TransportType } from "#enum/TransportType";
import { Entity } from "#utility/Entity";
import { NameCustom, NameFormatted, NameLocalized } from "#utility/name.utils";

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
    vehicles: number,
    xtmData?: {
        Acronym: string
    }
    routeNumber: number,
    isFixedColor: boolean
}

export type StationData = {
    readonly entity: Entity,
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
    arrivingVehicle?: VehicleData,
    arrivingVehicleDistance?: number,
    arrivingVehicleStops?: number,
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

export type LineDetails = {
    LineData: LineData,
    StopCapacity: number,
    Stops: StationData[]
    Vehicles: VehicleData[],
    Segments: SegmentData[]
}

export type MapViewerOptions = {
    showDistricts: boolean,
    showDistances: boolean,
    showVehicles: boolean,
    showIntegrations: boolean,
    useWhiteBackground: boolean
}

export class LineManagementService {
    static async setLineFixedColor(entity: Entity, x: string): Promise<`#${string}`> {
        return await engine.call("k45::xtm.lineManagement.setRouteFixedColor", entity, x);
    }
    static async setIgnorePalette(entity: Entity, x: boolean): Promise<boolean> {
        return await engine.call("k45::xtm.lineManagement.setIgnorePalette", entity, x);
    }
    static async setLineAcronym(entity: Entity, x: string): Promise<string> {
        return await engine.call("k45::xtm.lineManagement.setRouteAcronym", entity, x);
    }
    static async setLineNumber(entity: Entity, x: number): Promise<string> {
        return await engine.call("k45::xtm.lineManagement.setRouteNumber", entity, x);
    }
    static async setLineName(entity: Entity, x: string): Promise<NameFormatted | NameCustom> {
        return await engine.call("k45::xtm.lineManagement.setRouteName", entity, x);
    }
}