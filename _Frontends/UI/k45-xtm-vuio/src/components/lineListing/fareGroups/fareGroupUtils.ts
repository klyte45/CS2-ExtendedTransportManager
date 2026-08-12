import { Entity } from "@klyte45/vuio-commons";
import { FareGroupHourExceptionDto } from "#service/FareGroupService";

export const MAX_FARE_EXCEPTIONS = 20;

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

/** Inclusive ranges: shared boundary hours conflict. */
export function rangesOverlap(
    a: { startingHour: number; endingHour: number },
    b: { startingHour: number; endingHour: number },
): boolean {
    return a.startingHour <= b.endingHour && b.startingHour <= a.endingHour;
}

export function isValidExceptionRow(row: FareGroupHourExceptionDto): boolean {
    if (row.startingHour < 0 || row.startingHour > 23) return false;
    if (row.endingHour < 0 || row.endingHour > 23) return false;
    return row.startingHour <= row.endingHour;
}

export function findExceptionOverlapError(
    exceptions: FareGroupHourExceptionDto[],
): string | null {
    if (exceptions.length > MAX_FARE_EXCEPTIONS) {
        return "max";
    }
    for (let i = 0; i < exceptions.length; i++) {
        if (!isValidExceptionRow(exceptions[i])) {
            return "invalid";
        }
    }
    for (let i = 0; i < exceptions.length; i++) {
        for (let j = i + 1; j < exceptions.length; j++) {
            if (rangesOverlap(exceptions[i], exceptions[j])) {
                return "overlap";
            }
        }
    }
    return null;
}

/** True when at least one free inclusive hour slot remains for a new exception. */
export function hasFreeExceptionSlot(exceptions: FareGroupHourExceptionDto[]): boolean {
    if (exceptions.length >= MAX_FARE_EXCEPTIONS) return false;
    const covered = new Array<boolean>(24).fill(false);
    for (const ex of exceptions) {
        if (!isValidExceptionRow(ex)) continue;
        for (let h = ex.startingHour; h <= ex.endingHour; h++) {
            covered[h] = true;
        }
    }
    return covered.some((c) => !c);
}

export function firstFreeExceptionSlot(
    exceptions: FareGroupHourExceptionDto[],
    defaultFare: number,
): FareGroupHourExceptionDto | null {
    if (!hasFreeExceptionSlot(exceptions)) return null;
    const covered = new Array<boolean>(24).fill(false);
    for (const ex of exceptions) {
        if (!isValidExceptionRow(ex)) continue;
        for (let h = ex.startingHour; h <= ex.endingHour; h++) {
            covered[h] = true;
        }
    }
    const start = covered.findIndex((c) => !c);
    if (start < 0) return null;
    return {
        startingHour: start,
        endingHour: start,
        fareValue: Math.round(defaultFare),
    };
}
