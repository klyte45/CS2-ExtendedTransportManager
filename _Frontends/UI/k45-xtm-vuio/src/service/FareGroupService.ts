import { Entity } from "@klyte45/vuio-commons";
import engine from "cohtml/cohtml";
import { LineShieldInfo } from "./SegmentOccupancyService";

export type FareGroupListItem = {
    entity: Entity;
    name: string;
    defaultFare: number;
    lineCount: number;
};

export type FareGroupHourExceptionDto = {
    startingHour: number;
    endingHour: number;
    fareValue: number;
};

export type FareGroupDetail = {
    entity: Entity;
    name: string;
    defaultFare: number;
    exceptions: FareGroupHourExceptionDto[];
    lines: Entity[];
};

export type FareGroupLineShieldInfo = {
    shield: LineShieldInfo;
    fareGroup: Entity;
    active: boolean;
};

export type FareTicketSliderBounds = {
    min: number;
    max: number;
    step: number;
    defaultValue: number;
};

export class FareGroupService {
    static async list(): Promise<FareGroupListItem[]> {
        return (await engine.call("k45::xtm.fareGroups.list")) ?? [];
    }

    static async create(): Promise<Entity> {
        return await engine.call("k45::xtm.fareGroups.create");
    }

    static async delete(group: Entity): Promise<boolean> {
        return await engine.call("k45::xtm.fareGroups.delete", group);
    }

    static async detail(group: Entity): Promise<FareGroupDetail | null> {
        return await engine.call("k45::xtm.fareGroups.detail", group);
    }

    static async listShieldLines(
        includePassengers = true,
        includeCargo = true,
        includeInactive = true,
    ): Promise<FareGroupLineShieldInfo[]> {
        return (
            (await engine.call(
                "k45::xtm.fareGroups.listShieldLines",
                includePassengers,
                includeCargo,
                includeInactive,
            )) ?? []
        );
    }

    static async save(group: Entity, detail: FareGroupDetail): Promise<boolean> {
        return await engine.call("k45::xtm.fareGroups.save", group, detail);
    }

    static async ticketSliderBounds(): Promise<FareTicketSliderBounds> {
        return (
            (await engine.call("k45::xtm.fareGroups.ticketSliderBounds")) ?? {
                min: 0,
                max: 100,
                step: 1,
                defaultValue: 0,
            }
        );
    }
}
