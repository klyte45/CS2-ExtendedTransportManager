import { Entity } from "@klyte45/vuio-commons";
import engine from "cohtml/cohtml";
import { LineShieldInfo } from "./SegmentOccupancyService";

export type VehicleModelPairDto = {
    primaryPrefab: Entity;
    secondaryPrefab: Entity;
};

export type VehicleModelGroupListItem = {
    entity: Entity;
    name: string;
    transportType: number;
    isCargo: boolean;
    modelCount: number;
    lineCount: number;
};

export type VehicleModelGroupDetail = {
    entity: Entity;
    name: string;
    transportType: number;
    isCargo: boolean;
    models: VehicleModelPairDto[];
    lines: Entity[];
};

export type VehicleModelGroupLineShieldInfo = {
    shield: LineShieldInfo;
    vehicleModelGroup: Entity;
    active: boolean;
};

export type VehicleModelPrefabInfo = {
    entity: Entity;
    name: string;
    imageUrl: string;
    capacity: number;
    isSecondary: boolean;
    meshWidth: number;
    meshHeight: number;
    meshDepth: number;
    /** Mesh depth of this prefab alone (never multiplied by unit count). */
    singleMeshDepth: number;
    compositionDescriptor: string;
    compositionUnitCount: number;
    carsPerUnitCount: number;
};

export type VehicleModelAvailableVehicles = {
    primary: VehicleModelPrefabInfo[];
    secondary: VehicleModelPrefabInfo[];
};

export type VehicleModelPresentType = {
    transportType: number;
    isCargo: boolean;
};

export type VehicleModelGroupLineMembership = {
    group: Entity;
    groupName: string;
    lineCount: number;
    lineLabels: string[];
    overflowCount: number;
    transportType: number;
    isCargo: boolean;
};

export class VehicleModelGroupService {
    static async list(): Promise<VehicleModelGroupListItem[]> {
        return (await engine.call("k45::xtm.vehicleModelGroups.list")) ?? [];
    }

    static async create(transportType: number, isCargo: boolean): Promise<Entity> {
        return await engine.call("k45::xtm.vehicleModelGroups.create", transportType, isCargo);
    }

    static async delete(group: Entity): Promise<boolean> {
        return await engine.call("k45::xtm.vehicleModelGroups.delete", group);
    }

    static async detail(group: Entity): Promise<VehicleModelGroupDetail | null> {
        return await engine.call("k45::xtm.vehicleModelGroups.detail", group);
    }

    static async lineMembership(line: Entity): Promise<VehicleModelGroupLineMembership | null> {
        return (await engine.call("k45::xtm.vehicleModelGroups.lineMembership", line)) ?? null;
    }

    static async listShieldLines(
        transportType: number,
        isCargo: boolean,
        includeInactive = true,
    ): Promise<VehicleModelGroupLineShieldInfo[]> {
        return (
            (await engine.call(
                "k45::xtm.vehicleModelGroups.listShieldLines",
                transportType,
                isCargo,
                includeInactive,
            )) ?? []
        );
    }

    static async save(group: Entity, detail: VehicleModelGroupDetail): Promise<boolean> {
        return await engine.call("k45::xtm.vehicleModelGroups.save", group, detail);
    }

    static async listAvailableVehicles(
        transportType: number,
        isCargo: boolean,
    ): Promise<VehicleModelAvailableVehicles> {
        return (
            (await engine.call(
                "k45::xtm.vehicleModelGroups.listAvailableVehicles",
                transportType,
                isCargo,
            )) ?? { primary: [], secondary: [] }
        );
    }

    static async listPresentTypes(): Promise<VehicleModelPresentType[]> {
        return (await engine.call("k45::xtm.vehicleModelGroups.listPresentTypes")) ?? [];
    }

    /** Assign line to group, or pass null/Entity.Null to remove membership. */
    static async assignLine(line: Entity, group: Entity | null): Promise<boolean> {
        return await engine.call(
            "k45::xtm.vehicleModelGroups.assignLine",
            line,
            group ?? { Index: 0, Version: 0 },
        );
    }
}
