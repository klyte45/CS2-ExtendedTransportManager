import { TlmLineFormatCmp } from "#components/lineViewer/TlmLineFormatCmp";
import { TransportType } from "#enum/TransportType";
import { Unit } from "#enum/Unit";
import { LineData, LineManagementService } from "#service/LineManagementService";
import translate from "#utility/translate";
import {
    ColorUtils,
    nameToString,
    onRecalculateContextMenuPosition,
    toVanillaEntity,
    VanillaComponentResolver,
    VanillaFnResolver,
} from "@klyte45/vuio-commons";
import engine from "cohtml/cohtml";
import { transport } from "cs2/bindings";
import { FocusDisabled } from "cs2/input";
import { LocalizedNumber, useLocalization } from "cs2/l10n";
import { getModule } from "cs2/modding";
import { Portal } from "cs2/ui";
import { CSSProperties, MouseEvent, useEffect, useRef, useState } from "react";
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
    typeUsesPalette: boolean;
    onOpenDetails(): void;
    onActivityChange(activity: LineActivityClass): void;
    onColorChange(color: string, isFixedColor: boolean): void;
};

const SCHEDULE_TOOLTIP_KEYS: Record<LineActivityClass, [string, string]> = {
    "activity-disabled": ["lineList.filterDisabled", "Disabled"],
    "activity-dayNight": ["lineList.filterDayNight", "Day & night"],
    "activity-day": ["lineList.filterDay", "Day only"],
    "activity-night": ["lineList.filterNight", "Night only"],
};

const titleTextInputTheme = getModule(
    "game-ui/game/components/selected-info-panel/shared-components/text-input/text-input.module.scss",
    "classes",
);

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

/** Viewport coords for position:fixed menus — offset* walks ignore scroll parents. */
function getViewportPosition(el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    return { left: rect.left, top: rect.top };
}

function isEventOnElement(event: globalThis.MouseEvent, el: HTMLElement | null) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return (
        event.clientX >= rect.left
        && event.clientX <= rect.right
        && event.clientY >= rect.top
        && event.clientY <= rect.bottom
    );
}

export const LineItemCard = ({
    lineData: x,
    typeUsesPalette,
    onOpenDetails,
    onActivityChange,
    onColorChange,
}: LineItemCardProps) => {
    const localization = useLocalization();
    const typeIndex = `${x.type}.${x.isCargo}`;
    const displayColor = x.color;
    const fontColor = ColorUtils.toRGBA(ColorUtils.getContrastColorFor(ColorUtils.toColor01(displayColor)));
    const effectiveIdentifier = x.xtmData?.Acronym || x.routeNumber.toFixed();
    const iconUrl = TYPE_TO_ICONS[typeIndex] ?? TYPE_TO_ICONS[`${TransportType.Bus}.false`];
    const activityClass = getLineActivityClass(x);
    const activityColors = LINE_ACTIVITY_COLORS[activityClass];
    const resolvedName = nameToString(x.name) ?? "";
    const [nameValue, setNameValue] = useState(resolvedName);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [menuCss, setMenuCss] = useState({} as CSSProperties);
    const iconRef = useRef<HTMLDivElement>(null!);
    const pickerRef = useRef<HTMLDivElement>(null!);
    const EllipsisTextInput = VanillaComponentResolver.instance.EllipsisTextInput;
    const InfoLink = VanillaComponentResolver.instance.InfoLink;
    const ColorPicker = VanillaComponentResolver.instance.ColorPicker;
    const noFocus = VanillaComponentResolver.instance.FOCUS_DISABLED;
    const VanillaColorUtils = VanillaFnResolver.instance.color;
    const canRestorePalette = typeUsesPalette && x.isFixedColor;

    useEffect(() => {
        setNameValue(resolvedName);
    }, [resolvedName, x.entity.Index]);

    useEffect(() => {
        if (!pickerOpen || !iconRef.current) return;
        setMenuCss(onRecalculateContextMenuPosition(iconRef, getViewportPosition(iconRef.current)));
    }, [pickerOpen]);

    useEffect(() => {
        if (!pickerOpen) return;
        const handleClickOutside = (event: globalThis.MouseEvent) => {
            if (isEventOnElement(event, iconRef.current)) return;
            if (isEventOnElement(event, pickerRef.current)) return;
            setPickerOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside, true);
        return () => document.removeEventListener("mousedown", handleClickOutside, true);
    }, [pickerOpen]);

    const onSchedulePointer = (activity: LineActivityClass, e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (activity === activityClass) return;
        applyLineActivity(x.entity, activity);
        onActivityChange(activity);
    };

    const onNameChange = (e: any) => {
        setNameValue(e?.target?.value ?? e ?? "");
    };

    const onNameBlur = () => {
        const trimmed = (nameValue ?? "").trim();
        if (!trimmed) {
            setNameValue(resolvedName);
            return;
        }
        if (trimmed === resolvedName) return;
        transport.renameLine(toVanillaEntity(x.entity as any), trimmed);
    };

    const onFormatIconPointer = (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setPickerOpen((open) => {
            const next = !open;
            if (next && iconRef.current) {
                setMenuCss(onRecalculateContextMenuPosition(iconRef, getViewportPosition(iconRef.current)));
            }
            return next;
        });
    };

    const onPickerColorChange = async (hsva: any) => {
        const hex = ColorUtils.toRGBHex(VanillaColorUtils.hsvaToRgba(hsva));
        onColorChange(hex, true);
        if (!x.isFixedColor) {
            await LineManagementService.setIgnorePalette(x.entity, true);
        }
        await LineManagementService.setRouteFixedColor(x.entity, hex);
    };

    const onRestorePalette = async (e?: MouseEvent) => {
        e?.stopPropagation();
        e?.preventDefault();
        setPickerOpen(false);
        await LineManagementService.setIgnorePalette(x.entity, false);
        onColorChange(displayColor, false);
    };

    return (
        <div
            className={`BgItem ${activityClass}`}
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
                    "--xtm-line-color": ColorUtils.getClampedColor(displayColor),
                    "--xtm-font-color": fontColor,
                    "--xtm-game-icon": `url(${iconUrl})`,
                } as CSSProperties}
            >
                <div className="text">{effectiveIdentifier}</div>
                <div
                    className="formatIconHost"
                    ref={iconRef}
                    role="button"
                    title={translate("lineList.editColor", "Change line color")}
                    onMouseDown={onFormatIconPointer}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                >
                    <TlmLineFormatCmp
                        className="icon"
                        {...x}
                        color={displayColor}
                        borderWidth="2px"
                        contentOverride={<div className="gameIcon" />}
                    />
                </div>
                {pickerOpen && (
                    <Portal>
                        <div
                            ref={pickerRef}
                            style={menuCss}
                            className="k45_comm_contextMenu xtmLineColorPickerOverlay"
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <ColorPicker
                                alpha={false}
                                focusKey={noFocus}
                                // Runtime enum is numeric; string "None" incorrectly shows preview
                                preview={0 as any}
                                // Pin HSV so the mode dropdown (portaled) does not escape the popup
                                mode={"Hsv" as any}
                                color={VanillaColorUtils.rgbaToHsva(ColorUtils.toColor01(displayColor))}
                                onChange={onPickerColorChange}
                                hexInput
                                colorWheel
                                sliderTextInput
                            />
                            {canRestorePalette && (
                                <button
                                    type="button"
                                    className="neutralBtn txt restorePaletteInPicker"
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        onRestorePalette();
                                    }}
                                >
                                    {translate("lineList.restorePalette", "Restore palette color")}
                                </button>
                            )}
                        </div>
                    </Portal>
                )}
            </div>
            <div className="lineName">
                <FocusDisabled>
                    <EllipsisTextInput
                        className="nameInput"
                        theme={titleTextInputTheme}
                        value={nameValue}
                        onChange={onNameChange}
                        onBlur={onNameBlur}
                    />
                </FocusDisabled>
            </div>
            <div className="lineType">
                <span className="typeLabel">{getNameFor(x.type, x.isCargo)}</span>
                <FocusDisabled>
                    <InfoLink onSelect={onOpenDetails}>
                        {translate("lineList.openDetails", "Details")}
                    </InfoLink>
                </FocusDisabled>
            </div>
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
