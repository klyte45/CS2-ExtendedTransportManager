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
