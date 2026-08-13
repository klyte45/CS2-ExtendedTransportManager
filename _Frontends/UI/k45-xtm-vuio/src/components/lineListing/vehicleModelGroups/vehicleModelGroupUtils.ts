import { Entity } from "@klyte45/vuio-commons";
import { TransportType } from "#enum/TransportType";
import engine from "cohtml/cohtml";

/**
 * Matches Game.Prefabs.TransportType numeric values.
 * None = -1; subsequent values are sequential (Bus=0 … Ferry=11).
 */
export const TRANSPORT_TYPE_BY_INT: Record<number, TransportType> = {
    [-1]: TransportType.None,
    0: TransportType.Bus,
    1: TransportType.Train,
    2: TransportType.Taxi,
    3: TransportType.Tram,
    4: TransportType.Ship,
    5: TransportType.Post,
    6: TransportType.Helicopter,
    7: TransportType.Airplane,
    8: TransportType.Subway,
    9: TransportType.Rocket,
    // Work = 10 (not exposed in UI enum)
    11: TransportType.Ferry,
};

export function transportTypeFromInt(value: number): TransportType {
    return TRANSPORT_TYPE_BY_INT[value] ?? TransportType.None;
}

export function transportTypeToInt(type: TransportType | string): number {
    const entry = Object.entries(TRANSPORT_TYPE_BY_INT).find(([, v]) => v === type);
    return entry ? Number(entry[0]) : 0;
}

export function typeKey(transportType: number, isCargo: boolean): string {
    return `${transportTypeFromInt(transportType)}.${isCargo}`;
}

export function supportsSecondary(transportType: number): boolean {
    const t = transportTypeFromInt(transportType);
    return t === TransportType.Train || t === TransportType.Tram || t === TransportType.Subway;
}

export function entityKey(entity: Entity | null | undefined): string {
    if (!entity) return "";
    return `${entity.Index}_${entity.Version ?? 0}`;
}

export function entitiesEqual(a: Entity | null | undefined, b: Entity | null | undefined): boolean {
    if (!a || !b) return !a && !b;
    return a.Index === b.Index && (a.Version ?? 0) === (b.Version ?? 0);
}

export function isNullEntity(entity: Entity | null | undefined): boolean {
    return !entity || entity.Index === 0;
}

export function nullEntity(): Entity {
    return { Index: 0, Version: 0 } as Entity;
}

export function sortByEntityIndex<T extends { entity: Entity }>(items: T[]): T[] {
    return items.slice().sort((a, b) => (a.entity?.Index ?? 0) - (b.entity?.Index ?? 0));
}

export function hasAtLeastOneModel(
    models: { primaryPrefab?: Entity | null; secondaryPrefab?: Entity | null }[] | null | undefined,
): boolean {
    if (!models || models.length === 0) return false;
    return models.some(
        (m) => !isNullEntity(m.primaryPrefab) || !isNullEntity(m.secondaryPrefab),
    );
}

/** Resolve game asset display name from prefab id (`Assets.NAME[...]`). */
export function localizePrefabName(prefabName: string | null | undefined): string {
    if (!prefabName) return "";
    const key = `Assets.NAME[${prefabName}]`;
    const translated = engine.translate(key);
    if (!translated || translated === key) return prefabName;
    return translated;
}

/** Stable key for a primary+secondary composition pair. */
export function compositionPairKey(
    primary: Entity | null | undefined,
    secondary: Entity | null | undefined,
): string {
    return `${entityKey(isNullEntity(primary) ? null : primary)}|${entityKey(isNullEntity(secondary) ? null : secondary)}`;
}

export type VehiclePrefabSortKey = "name" | "capacity" | "length";

export type VehiclePrefabSort = {
    key: VehiclePrefabSortKey;
    descending: boolean;
};

export const VEHICLE_PREFAB_SORT_KEYS: VehiclePrefabSortKey[] = ["name", "capacity", "length"];

/** Capacity descending by default (largest first). */
export const DEFAULT_VEHICLE_PREFAB_SORT: VehiclePrefabSort = {
    key: "capacity",
    descending: true,
};

export function nextVehiclePrefabSort(
    current: VehiclePrefabSort,
    key: VehiclePrefabSortKey,
): VehiclePrefabSort {
    if (current.key === key) {
        return { key, descending: !current.descending };
    }
    // Capacity defaults to largest-first; name/length to ascending.
    return { key, descending: key === "capacity" };
}

/** Vehicle length for sorting (mesh depth × composition units when known). */
export function prefabTotalLength(info: {
    meshDepth?: number;
    compositionUnitCount?: number;
}): number {
    const depth = info.meshDepth ?? 0;
    const units = info.compositionUnitCount ?? 0;
    return depth * Math.max(1, units);
}

export function sortVehiclePrefabs<T extends {
    name?: string;
    capacity?: number;
    meshDepth?: number;
    compositionUnitCount?: number;
}>(items: T[], sort: VehiclePrefabSort): T[] {
    return items.slice().sort((a, b) => {
        let cmp = 0;
        switch (sort.key) {
            case "name":
                cmp = localizePrefabName(a.name).localeCompare(localizePrefabName(b.name), undefined, {
                    numeric: true,
                    sensitivity: "base",
                });
                break;
            case "capacity":
                cmp = (a.capacity ?? 0) - (b.capacity ?? 0);
                break;
            case "length":
                cmp = prefabTotalLength(a) - prefabTotalLength(b);
                break;
        }
        return sort.descending ? -cmp : cmp;
    });
}
