import { TlmLineFormatCmp } from "#components/lineViewer/TlmLineFormatCmp";
import { TransportType } from "#enum/TransportType";
import { Unit } from "#enum/Unit";
import { LineData } from "#service/LineManagementService";
import translate from "#utility/translate";
import { ColorUtils, nameToString, toVanillaEntity } from "@klyte45/vuio-commons";
import engine from "cohtml/cohtml";
import { transport } from "cs2/bindings";
import { LocalizedNumber, useLocalization } from "cs2/l10n";
import { CSSProperties, MouseEvent } from "react";
import {
    ACTIVITY_TO_ICONS,
    activityToLineFlags,
    getLineActivityClass,
    LINE_ACTIVITY_COLORS,
    LineActivityClass,
    SCHEDULE_BUTTON_ACTIVE_BG,
    SCHEDULE_BUTTON_IDLE_BG,
    SCHEDULE_COLUMN_ORDER,
    TYPE_TO_ICONS,
} from "./lineListingTypes";

type LineItemCardProps = {
    lineData: LineData;
    onClick(): void;
    onActivityChange(activity: LineActivityClass): void;
};

const SCHEDULE_TOOLTIP_KEYS: Record<LineActivityClass, [string, string]> = {
    "activity-disabled": ["lineList.filterDisabled", "Disabled"],
    "activity-dayNight": ["lineList.filterDayNight", "Day & night"],
    "activity-day": ["lineList.filterDay", "Day only"],
    "activity-night": ["lineList.filterNight", "Night only"],
};

function getNameFor(type: string, isCargo: boolean) {
    return engine.translate(isCargo ? `Transport.ROUTES[${type}]` : `Transport.LINES[${type}]`);
}

function formatLineLoad(localization: ReturnType<typeof useLocalization>, line: LineData): string {
    if (line.isCargo) {
        return LocalizedNumber.renderString(localization, { value: line.cargo, unit: Unit.Weight });
    }
    return [
        LocalizedNumber.renderString(localization, { value: line.cargo, unit: Unit.Integer }),
        engine.translate(`Transport.LEGEND_PASSENGERS[${line.type}]`),
    ].join(" ");
}

function applyLineActivity(entity: LineData["entity"], activity: LineActivityClass): void {
    const vanilla = toVanillaEntity(entity as any);
    const flags = activityToLineFlags(activity);
    transport.setLineActive(vanilla, flags.active);
    if (flags.active) {
        transport.setLineSchedule(vanilla, flags.schedule);
    }
}

export const LineItemCard = ({ lineData: x, onClick, onActivityChange }: LineItemCardProps) => {
    const localization = useLocalization();
    const typeIndex = `${x.type}.${x.isCargo}`;
    const fontColor = ColorUtils.toRGBA(ColorUtils.getContrastColorFor(ColorUtils.toColor01(x.color)));
    const effectiveIdentifier = x.xtmData?.Acronym || x.routeNumber.toFixed();
    const iconUrl = TYPE_TO_ICONS[typeIndex] ?? TYPE_TO_ICONS[`${TransportType.Bus}.false`];
    const activityClass = getLineActivityClass(x);
    const activityColors = LINE_ACTIVITY_COLORS[activityClass];

    const onSchedulePointer = (activity: LineActivityClass, e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (activity === activityClass) return;
        applyLineActivity(x.entity, activity);
        onActivityChange(activity);
    };

    return (
        <div
            className={`BgItem ${activityClass}`}
            onClick={onClick}
            style={{
                "--xtm-activity-tint": activityColors.tint,
                "--xtm-name-color": activityColors.nameColor,
            } as CSSProperties}
        >
            <div
                className="activityTint"
                style={{ backgroundColor: activityColors.tint }}
            />
            <div
                className="lineAcronym"
                style={{
                    "--xtm-line-color": ColorUtils.getClampedColor(x.color),
                    "--xtm-font-color": fontColor,
                    "--xtm-game-icon": `url(${iconUrl})`,
                } as CSSProperties}
            >
                <div className="text">{effectiveIdentifier}</div>
                <TlmLineFormatCmp className="icon" {...x} borderWidth="2px" contentOverride={<div className="gameIcon" />} />
            </div>
            <div className="lineName" style={{ color: activityColors.nameColor }}>
                {nameToString(x.name)}
            </div>
            <div className="lineType">{getNameFor(x.type, x.isCargo)}</div>
            <div className="lineLength">
                {activityClass === "activity-disabled"
                    ? LocalizedNumber.renderString(localization, { value: x.length, unit: Unit.Length })
                    : [
                          LocalizedNumber.renderString(localization, { value: x.length, unit: Unit.Length }),
                          formatLineLoad(localization, x),
                      ].join(" • ")}
            </div>
            <div className="lineVehicles">
                {activityClass === "activity-disabled"
                    ? translate("lineList.lineDisabled", "Line disabled")
                    : [
                          `${x.vehicles} ${engine.translate(`Transport.LEGEND_VEHICLES[${x.type}]`)}`,
                          LocalizedNumber.renderString(localization, {
                              value: x.usage * 100,
                              unit: Unit.PercentageSingleFraction,
                          }),
                      ].join(" • ")}
            </div>
            <div className="scheduleColumn">
                {SCHEDULE_COLUMN_ORDER.map((key) => {
                    const isCurrent = key === activityClass;
                    return (
                        <div
                            key={key}
                            role="button"
                            className={`scheduleBtn${isCurrent ? " current" : ""}`}
                            title={translate(...SCHEDULE_TOOLTIP_KEYS[key])}
                            style={{
                                backgroundColor: isCurrent
                                    ? SCHEDULE_BUTTON_ACTIVE_BG[key]
                                    : SCHEDULE_BUTTON_IDLE_BG,
                            }}
                            onMouseDown={(e) => onSchedulePointer(key, e)}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                            }}
                        >
                            <div
                                className="scheduleIcon"
                                style={{
                                    backgroundImage: `url(assetdb://gameui/${ACTIVITY_TO_ICONS[key]})`,
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
