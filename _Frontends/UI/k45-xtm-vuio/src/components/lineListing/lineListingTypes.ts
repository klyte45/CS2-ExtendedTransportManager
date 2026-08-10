import { TransportType } from "#enum/TransportType";

export const TYPE_TO_ICONS: Record<string, string> = {
    [`${TransportType.Bus}.false`]: "assetdb://gameui/Media/Game/Icons/BusLine.svg",
    [`${TransportType.Tram}.false`]: "assetdb://gameui/Media/Game/Icons/TramLine.svg",
    [`${TransportType.Subway}.false`]: "assetdb://gameui/Media/Game/Icons/SubwayLine.svg",
    [`${TransportType.Train}.false`]: "assetdb://gameui/Media/Game/Icons/PassengerTrainLine.svg",
    [`${TransportType.Ship}.false`]: "assetdb://gameui/Media/Game/Icons/PassengerShipLine.svg",
    [`${TransportType.Ferry}.false`]: "assetdb://gameui/Media/Game/Icons/PassengerShipLine.svg",
    [`${TransportType.Airplane}.false`]: "assetdb://gameui/Media/Game/Icons/PassengerAirplaneLine.svg",
    [`${TransportType.Train}.true`]: "assetdb://gameui/Media/Game/Icons/CargoTrainLine.svg",
    [`${TransportType.Ship}.true`]: "assetdb://gameui/Media/Game/Icons/CargoShipLine.svg",
    [`${TransportType.Airplane}.true`]: "assetdb://gameui/Media/Game/Icons/CargoAirplaneLine.svg",
};

export const TYPE_ORDER = Object.keys(TYPE_TO_ICONS);

/** Matches vanilla RouteSchedule / transportationOverview schedule values. */
export enum LineSchedule {
    Day = 0,
    Night = 1,
    DayAndNight = 2,
}

export type LineActivityClass =
    | "activity-dayNight"
    | "activity-day"
    | "activity-night"
    | "activity-disabled";

/** Vanilla glyphs used on TransportLineItem / getScheduleIcon. */
export const ACTIVITY_TO_ICONS: Record<LineActivityClass, string> = {
    "activity-disabled": "Media/Glyphs/OnOff.svg",
    "activity-dayNight": "Media/Game/Misc/ScheduleDayNight.svg",
    "activity-day": "Media/Game/Misc/ScheduleDay.svg",
    "activity-night": "Media/Game/Misc/ScheduleNight.svg",
};

export const ACTIVITY_ORDER = Object.keys(ACTIVITY_TO_ICONS) as LineActivityClass[];

/** Card schedule strip: fully enabled (top) → disabled (bottom). */
export const SCHEDULE_COLUMN_ORDER: LineActivityClass[] = [
    "activity-dayNight",
    "activity-day",
    "activity-night",
    "activity-disabled",
];

export const SCHEDULE_BUTTON_IDLE_BG = "rgba(90, 90, 90, 0.75)";

/** Selected strip button matches that status's card tint (stronger for readability). */
export const SCHEDULE_BUTTON_ACTIVE_BG: Record<LineActivityClass, string> = {
    "activity-dayNight": "rgba(120, 200, 120, 0.55)",
    "activity-day": "rgba(252, 243, 125, 0.55)",
    "activity-night": "rgba(145, 99, 206, 0.55)",
    "activity-disabled": "rgba(200, 50, 50, 0.55)",
};

/** Translucent tint over menuPanel1+blur (rgba — Cohtml ignores hsl()). Name ≈ 20% sat / 80% light. */
export const LINE_ACTIVITY_COLORS: Record<
    LineActivityClass,
    { tint: string; nameColor: string }
> = {
    "activity-dayNight": { tint: "rgba(0, 0, 0, 0)", nameColor: "var(--textColor)" },
    "activity-day": { tint: "rgba(252, 243, 125, 0.28)", nameColor: "#d6d2c2" },
    "activity-night": { tint: "rgba(145, 99, 206, 0.28)", nameColor: "#cfc2d6" },
    "activity-disabled": { tint: "rgba(200, 50, 50, 0.28)", nameColor: "#d6c2c2" },
};

export function getLineActivityClass(line: { active: boolean; schedule: number }): LineActivityClass {
    if (!line.active) return "activity-disabled";
    if (line.schedule === LineSchedule.Day) return "activity-day";
    if (line.schedule === LineSchedule.Night) return "activity-night";
    return "activity-dayNight";
}

export function activityToLineFlags(activity: LineActivityClass): { active: boolean; schedule: number } {
    if (activity === "activity-disabled") {
        return { active: false, schedule: LineSchedule.DayAndNight };
    }
    if (activity === "activity-day") return { active: true, schedule: LineSchedule.Day };
    if (activity === "activity-night") return { active: true, schedule: LineSchedule.Night };
    return { active: true, schedule: LineSchedule.DayAndNight };
}

export type LineSortKey =
    | "routeNumber"
    | "acronym"
    | "length"
    | "usage"
    | "cargo"
    | "schedule";

export type LineSort = {
    key: LineSortKey;
    descending: boolean;
};

export const LINE_SORT_KEYS: LineSortKey[] = [
    "routeNumber",
    "acronym",
    "length",
    "usage",
    "cargo",
    "schedule",
];

export const DEFAULT_LINE_SORT: LineSort = { key: "routeNumber", descending: false };

const SCHEDULE_SORT_RANK: Record<LineActivityClass, number> = {
    "activity-dayNight": 0,
    "activity-day": 1,
    "activity-night": 2,
    "activity-disabled": 3,
};

function lineAcronymSortValue(line: { xtmData?: { Acronym?: string }; routeNumber: number }): string {
    const acronym = line.xtmData?.Acronym?.trim();
    return acronym && acronym.length > 0 ? acronym : line.routeNumber.toFixed();
}

function compareLineSortKey(
    a: {
        routeNumber: number;
        length: number;
        usage: number;
        cargo: number;
        active: boolean;
        schedule: number;
        xtmData?: { Acronym?: string };
    },
    b: typeof a,
    key: LineSortKey,
): number {
    switch (key) {
        case "routeNumber":
            return a.routeNumber - b.routeNumber;
        case "acronym":
            return lineAcronymSortValue(a).localeCompare(lineAcronymSortValue(b), undefined, {
                numeric: true,
                sensitivity: "base",
            });
        case "length":
            return a.length - b.length;
        case "usage":
            // Asc = highest usage first
            return b.usage - a.usage;
        case "cargo":
            // Asc = highest passengers/cargo first
            return b.cargo - a.cargo;
        case "schedule":
            return (
                SCHEDULE_SORT_RANK[getLineActivityClass(a)] - SCHEDULE_SORT_RANK[getLineActivityClass(b)]
            );
        default:
            return 0;
    }
}

/** Stable group by transport type (preserves relative order within each type). */
export function groupLinesByTransportType<T extends { type: string; isCargo: boolean }>(lines: T[]): T[] {
    return lines.slice().sort((a, b) => {
        const typeA = `${a.type}.${a.isCargo}`;
        const typeB = `${b.type}.${b.isCargo}`;
        return TYPE_ORDER.indexOf(typeA) - TYPE_ORDER.indexOf(typeB);
    });
}

/** Sort by one key, then group by transport type. */
export function sortAndGroupLines<T extends {
    routeNumber: number;
    length: number;
    usage: number;
    cargo: number;
    active: boolean;
    schedule: number;
    type: string;
    isCargo: boolean;
    xtmData?: { Acronym?: string };
}>(lines: T[], sort: LineSort): T[] {
    const sorted = lines.slice().sort((a, b) => {
        const cmp = compareLineSortKey(a, b, sort.key);
        return sort.descending ? -cmp : cmp;
    });
    return groupLinesByTransportType(sorted);
}

/** Keep previous entity order when refreshing; append unknown lines, then regroup by type. */
export function mergeLinesPreservingOrder<T extends {
    entity: { Index: number };
    type: string;
    isCargo: boolean;
}>(previous: T[], incoming: T[]): T[] {
    if (previous.length === 0) return incoming.slice();
    const byId = new Map(incoming.map((line) => [line.entity.Index, line]));
    const ordered: T[] = [];
    for (const old of previous) {
        const next = byId.get(old.entity.Index);
        if (next) {
            ordered.push(next);
            byId.delete(old.entity.Index);
        }
    }
    for (const line of byId.values()) {
        ordered.push(line);
    }
    return groupLinesByTransportType(ordered);
}

export function nextLineSort(current: LineSort, key: LineSortKey): LineSort {
    if (current.key === key) {
        return { key, descending: !current.descending };
    }
    return { key, descending: false };
}
