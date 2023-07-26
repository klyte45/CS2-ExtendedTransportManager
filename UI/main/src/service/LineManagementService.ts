import { LineData } from "#components/lineListing/LineListCmp";
import { Entity } from "#utility/Entity";
import { NameCustom, NameFormatted, NameLocalized } from "#utility/name.utils";

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
    normalizedPosition: number,
    distanceNextStop: number
    distancePrevStop: number
};
export type SegmentData = {
    readonly start: number,
    readonly end: number,
    readonly sizeMeters: number,
    readonly broken: boolean
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