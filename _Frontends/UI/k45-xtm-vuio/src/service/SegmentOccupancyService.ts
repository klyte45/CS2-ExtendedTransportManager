import { Entity, NameCustom, NameFormatted } from "@klyte45/vuio-commons";
import engine from "cohtml/cohtml";

export type SimulationDateTimeJson = {
    year: number;
    month: number;
    hour: number;
    minute: number;
};

export type LineShieldInfo = {
    entity: Entity;
    name: NameCustom | NameFormatted;
    routeNumber: number;
    xtmData?: { Acronym: string };
    color: string;
    type: string;
    isCargo: boolean;
    isFixedColor: boolean;
    /** RouteSchedule: Day = 0, Night = 1, DayAndNight = 2. */
    schedule: number;
};

export type SegmentOccupancyStop = {
    lineEntity: Entity;
    waypoint: Entity;
    entity: Entity;
    name: NameCustom | NameFormatted;
    worldPosition: { x: number; y: number; z: number };
    district: Entity;
    districtName: NameCustom | NameFormatted;
    isOutsideConnection: boolean;
    azimuth: number;
};

export type SegmentOccupancyEntry = {
    lineEntity: Entity;
    sourceWaypointStopEntity: Entity;
    targetWaypointStopEntity: Entity;
    occupancyNumber: number;
    capacityRegistered: number;
    timeSpanBucket: number;
};

export type SegmentOccupancyReport = {
    cityDateTime: SimulationDateTimeJson;
    lines: LineShieldInfo[];
    stops: SegmentOccupancyStop[];
    segments: SegmentOccupancyEntry[];
};

export class SegmentOccupancyService {
    static async getCityReport(cargo: boolean): Promise<SegmentOccupancyReport> {
        return await engine.call("k45::xtm.segmentOccupancy.getCityReport", cargo);
    }
}
