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

/** Engine + carriage pairing is cargo rail only (Train / Tram / Subway cargo). */
export function supportsSecondary(transportType: number, isCargo: boolean): boolean {
    if (!isCargo) return false;
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

/** Max distinct primary+secondary slots choosable in the compositions UI. */
export function maxCompositionSlots(
    engineCount: number,
    carriageCount: number,
    showCarriagePicker: boolean,
): number {
    if (engineCount <= 0) return 0;
    if (!showCarriagePicker) return engineCount;
    // Engine × (no carriage + each carriage option).
    return engineCount * (carriageCount + 1);
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

/** Total length already baked into meshDepth for rail compositions. */
export function prefabTotalLength(info: {
    meshDepth?: number;
}): number {
    return info.meshDepth ?? 0;
}

/** Single-prefab mesh depth (never multiplied by unit count). */
export function prefabSingleLength(info: {
    singleMeshDepth?: number;
    meshDepth?: number;
}): number {
    return info.singleMeshDepth ?? info.meshDepth ?? 0;
}

/**
 * Total length for a fixed engine and wagon single-length W:
 * A × (E + W × (B − 1)).
 */
export function compositionLengthWithWagon(
    engine: { compositionUnitCount?: number; carsPerUnitCount?: number; singleMeshDepth?: number; meshDepth?: number } | null | undefined,
    wagonLen: number,
): number | null {
    if (!engine) return null;
    const units = engine.compositionUnitCount ?? 0;
    const cars = engine.carsPerUnitCount ?? 0;
    const engineLen = prefabSingleLength(engine);
    if (units <= 0 || cars <= 0 || engineLen <= 0) return null;
    const wagonsPerUnit = cars - 1;
    if (wagonsPerUnit <= 0) return units * engineLen;
    if (wagonLen <= 0) return null;
    return units * (engineLen + wagonLen * wagonsPerUnit);
}

/**
 * Engine + carriage total length when both prefabs are known.
 */
export function pairedCompositionLength(
    engine: { compositionUnitCount?: number; carsPerUnitCount?: number; singleMeshDepth?: number; meshDepth?: number } | null | undefined,
    carriage: { singleMeshDepth?: number; meshDepth?: number } | null | undefined,
): number | null {
    if (!engine || !carriage) return null;
    return compositionLengthWithWagon(engine, prefabSingleLength(carriage));
}

export function wagonSingleLengthBounds(
    carriages: { singleMeshDepth?: number; meshDepth?: number }[],
): { min: number; max: number } | null {
    let min = Number.POSITIVE_INFINITY;
    let max = 0;
    for (const carriage of carriages) {
        const len = prefabSingleLength(carriage);
        if (len <= 0) continue;
        min = Math.min(min, len);
        max = Math.max(max, len);
    }
    if (!Number.isFinite(min) || max <= 0) return null;
    return { min, max };
}

export function formatPairedCompositionLength(
    engine: { compositionUnitCount?: number; carsPerUnitCount?: number; singleMeshDepth?: number; meshDepth?: number } | null | undefined,
    carriage: { singleMeshDepth?: number; meshDepth?: number } | null | undefined,
    wagonBounds: { min: number; max: number } | null | undefined,
    formatLength: (value: number) => string | null,
    unknown = "?",
): string {
    if (!engine) return unknown;
    if (carriage) {
        const len = pairedCompositionLength(engine, carriage);
        if (len == null) return unknown;
        return formatLength(len) ?? unknown;
    }
    const cars = engine.carsPerUnitCount ?? 0;
    const wagonsPerUnit = cars - 1;
    if (wagonsPerUnit <= 0) {
        const len = compositionLengthWithWagon(engine, 0);
        if (len == null) return unknown;
        return formatLength(len) ?? unknown;
    }
    if (!wagonBounds) return unknown;
    const minLen = compositionLengthWithWagon(engine, wagonBounds.min);
    const maxLen = compositionLengthWithWagon(engine, wagonBounds.max);
    const minStr = minLen != null ? formatLength(minLen) : null;
    const maxStr = maxLen != null ? formatLength(maxLen) : null;
    if (!minStr || !maxStr) return unknown;
    if (minLen === maxLen) return minStr;
    return `${minStr} ~ ${maxStr}`;
}

export function sortVehiclePrefabs<T extends {
    name?: string;
    capacity?: number;
    meshDepth?: number;
    compositionUnitCount?: number;
}>(
    items: T[],
    sort: VehiclePrefabSort,
    isUnavailable?: (item: T) => boolean,
): T[] {
    return items.slice().sort((a, b) => {
        const aUnavailable = isUnavailable?.(a) ?? false;
        const bUnavailable = isUnavailable?.(b) ?? false;
        if (aUnavailable !== bUnavailable) {
            return aUnavailable ? 1 : -1;
        }

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
