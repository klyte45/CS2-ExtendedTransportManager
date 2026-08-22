import { TlmLineFormatCmp } from "#components/lineViewer/TlmLineFormatCmp";
import { TransportType } from "#enum/TransportType";
import { Unit } from "#enum/Unit";
import { LineData, LineManagementService } from "#service/LineManagementService";
import { getCrowdnessBorderStyle } from "#utility/lineViewerUtils";
import translate from "#utility/translate";
import {
    ColorUtils,
    nameToString,
    onRecalculateContextMenuPosition,
    toVanillaEntity,
    VanillaComponentResolver,
    VanillaFnResolver,
    VanillaWidgets,
} from "@klyte45/vuio-commons";
import engine from "cohtml/cohtml";
import { transport } from "cs2/bindings";
import { FocusDisabled } from "cs2/input";
import { LocalizedNumber, useLocalization } from "cs2/l10n";
import { getModule } from "cs2/modding";
import { Portal } from "cs2/ui";
import { CSSProperties, memo, MouseEvent, useEffect, useRef, useState } from "react";
import {
    ACTIVITY_TO_ICONS,
    activityToLineFlags,
    getLineActivityClass,
    LineActivityClass,
    SCHEDULE_BUTTON_ACTIVE_BG,
    SCHEDULE_BUTTON_IDLE_BG,
    SCHEDULE_COLUMN_ORDER,
    TYPE_TO_ICONS,
} from "./mainWindowTypes";

export type LineIdentityPatch = { acronym?: string; routeNumber?: number };

type LineItemCardProps = {
    lineData: LineData;
    typeUsesPalette: boolean;
    onOpenDetails(entity: LineData["entity"]): void;
    onActivityChange(entityIndex: number, activity: LineActivityClass): void;
    onColorChange(entityIndex: number, color: string, isFixedColor: boolean): void;
    onIdentityChange(entityIndex: number, patch: LineIdentityPatch): void;
    onLineNameChange(entityIndex: number, name: string): void;
};

const titleTextInputTheme = getModule(
    "game-ui/game/components/selected-info-panel/shared-components/text-input/text-input.module.scss",
    "classes",
);

/** Stable node so memo(TlmLineFormatCmp) is not defeated on every card render. */
const LISTING_GAME_ICON = <div className="gameIcon" />;

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

const LineItemCardCmp = ({
    lineData: x,
    typeUsesPalette,
    onOpenDetails,
    onActivityChange,
    onColorChange,
    onIdentityChange,
    onLineNameChange,
}: LineItemCardProps) => {
    const localization = useLocalization();
    const typeIndex = `${x.type}.${x.isCargo}`;
    const displayColor = x.color;
    const fontColor = ColorUtils.toRGBA(ColorUtils.getContrastColorFor(ColorUtils.toColor01(displayColor)));
    const effectiveIdentifier = x.xtmData?.Acronym || x.routeNumber.toFixed();
    const iconUrl = TYPE_TO_ICONS[typeIndex] ?? TYPE_TO_ICONS[`${TransportType.Bus}.false`];
    const activityClass = getLineActivityClass(x);
    const occupancyCrowd = getCrowdnessBorderStyle(x.usageMax ?? x.usage ?? 0);
    const resolvedName = nameToString(x.name) ?? "";
    const [nameValue, setNameValue] = useState(resolvedName);
    const [nameEditing, setNameEditing] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [identityOpen, setIdentityOpen] = useState(false);
    const [acronymDraft, setAcronymDraft] = useState(x.xtmData?.Acronym ?? "");
    const [numberDraft, setNumberDraft] = useState(x.routeNumber);
    const [colorMenuCss, setColorMenuCss] = useState({} as CSSProperties);
    const [identityMenuCss, setIdentityMenuCss] = useState({} as CSSProperties);
    const iconRef = useRef<HTMLDivElement>(null!);
    const pickerRef = useRef<HTMLDivElement>(null!);
    const identityTextRef = useRef<HTMLDivElement>(null!);
    const identityMenuRef = useRef<HTMLDivElement>(null!);
    const nameInputRef = useRef<HTMLInputElement>(null!);
    const skipNameCommitRef = useRef(false);
    const EllipsisTextInput = VanillaComponentResolver.instance.EllipsisTextInput;
    const ColorPicker = VanillaComponentResolver.instance.ColorPicker;
    const IntInput = VanillaComponentResolver.instance.IntInput;
    const noFocus = VanillaComponentResolver.instance.FOCUS_DISABLED;
    const VanillaColorUtils = VanillaFnResolver.instance.color;
    const StringInputField = VanillaWidgets.instance.StringInputField;
    const EditorItemRowNoFocus = VanillaWidgets.instance.EditorItemRowNoFocus;
    const editorModule = VanillaWidgets.instance.editorItemModule;
    const canRestorePalette = typeUsesPalette && x.isFixedColor;

    useEffect(() => {
        if (nameEditing) return;
        setNameValue(resolvedName);
    }, [resolvedName, x.entity.Index, nameEditing]);

    useEffect(() => {
        if (!nameEditing) return;
        const id = window.requestAnimationFrame(() => {
            nameInputRef.current?.focus?.();
            nameInputRef.current?.select?.();
        });
        return () => window.cancelAnimationFrame(id);
    }, [nameEditing]);

    useEffect(() => {
        if (identityOpen) return;
        setAcronymDraft(x.xtmData?.Acronym ?? "");
        setNumberDraft(x.routeNumber);
    }, [x.xtmData?.Acronym, x.routeNumber, x.entity.Index, identityOpen]);

    useEffect(() => {
        if (!pickerOpen || !iconRef.current) return;
        setColorMenuCss(onRecalculateContextMenuPosition(iconRef, getViewportPosition(iconRef.current)));
    }, [pickerOpen]);

    useEffect(() => {
        if (!identityOpen || !identityTextRef.current) return;
        setIdentityMenuCss(onRecalculateContextMenuPosition(identityTextRef, getViewportPosition(identityTextRef.current)));
    }, [identityOpen]);

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

    useEffect(() => {
        if (!identityOpen) return;
        const handleClickOutside = (event: globalThis.MouseEvent) => {
            if (isEventOnElement(event, identityTextRef.current)) return;
            if (isEventOnElement(event, identityMenuRef.current)) return;
            setIdentityOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside, true);
        return () => document.removeEventListener("mousedown", handleClickOutside, true);
    }, [identityOpen]);

    const onSchedulePointer = (activity: LineActivityClass, e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (activity === activityClass) return;
        applyLineActivity(x.entity, activity);
        onActivityChange(x.entity.Index, activity);
    };

    const startNameEdit = (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setPickerOpen(false);
        setIdentityOpen(false);
        setNameValue(resolvedName);
        setNameEditing(true);
    };

    const onNameChange = (e: any) => {
        setNameValue(e?.target?.value ?? e ?? "");
    };

    const commitNameEdit = () => {
        if (skipNameCommitRef.current) {
            skipNameCommitRef.current = false;
            setNameEditing(false);
            setNameValue(resolvedName);
            return;
        }
        const raw = nameInputRef.current?.value ?? nameValue ?? "";
        const trimmed = raw.trim();
        setNameEditing(false);
        if (!trimmed) {
            setNameValue(resolvedName);
            return;
        }
        setNameValue(trimmed);
        if (trimmed === resolvedName) return;
        transport.renameLine(toVanillaEntity(x.entity as any), trimmed);
        onLineNameChange(x.entity.Index, trimmed);
    };

    const onNameKeyDownCapture = (e: any) => {
        // TextInput blurs on Escape before bubbling onKeyDown; mark cancel first.
        if (e?.key === "Escape" || e?.keyCode === 27) {
            skipNameCommitRef.current = true;
            setNameValue(resolvedName);
        }
    };

    const onNameKeyDown = (e: any) => {
        if (e?.key === "Enter" || e?.keyCode === 13) {
            e.preventDefault?.();
            e.stopPropagation?.();
        }
    };

    const onFormatIconPointer = (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setIdentityOpen(false);
        setPickerOpen((open) => {
            const next = !open;
            if (next && iconRef.current) {
                setColorMenuCss(onRecalculateContextMenuPosition(iconRef, getViewportPosition(iconRef.current)));
            }
            return next;
        });
    };

    const onIdentityTextPointer = (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setPickerOpen(false);
        setIdentityOpen((open) => {
            const next = !open;
            if (next) {
                setAcronymDraft(x.xtmData?.Acronym ?? "");
                setNumberDraft(x.routeNumber);
                if (identityTextRef.current) {
                    setIdentityMenuCss(onRecalculateContextMenuPosition(identityTextRef, getViewportPosition(identityTextRef.current)));
                }
            }
            return next;
        });
    };

    const onPickerColorChange = async (hsva: any) => {
        const hex = ColorUtils.toRGBHex(VanillaColorUtils.hsvaToRgba(hsva));
        onColorChange(x.entity.Index, hex, true);
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
        onColorChange(x.entity.Index, displayColor, false);
    };

    const saveAcronym = async () => {
        const next = (acronymDraft ?? "").trim();
        const current = (x.xtmData?.Acronym ?? "").trim();
        if (next === current) return;
        await LineManagementService.setRouteAcronym(x.entity, next);
        onIdentityChange(x.entity.Index, { acronym: next });
    };

    const saveRouteNumber = async () => {
        const next = Number.isFinite(numberDraft) ? Math.trunc(numberDraft) : x.routeNumber;
        if (next === x.routeNumber) return;
        setNumberDraft(next);
        await LineManagementService.setRouteNumber(x.entity, next);
        onIdentityChange(x.entity.Index, { routeNumber: next });
    };

    return (
        <div className={`BgItem ${activityClass}`}>
            <div
                className="lineAcronym"
                style={{
                    "--xtm-line-color": ColorUtils.getClampedColor(displayColor),
                    "--xtm-font-color": fontColor,
                    "--xtm-game-icon": `url(${iconUrl})`,
                } as CSSProperties}
            >
                <div
                    className="text"
                    ref={identityTextRef}
                    role="button"
                    onMouseDown={onIdentityTextPointer}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                >
                    {effectiveIdentifier}
                </div>
                <div
                    className="formatIconHost"
                    ref={iconRef}
                    role="button"
                    onMouseDown={onFormatIconPointer}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                >
                    <TlmLineFormatCmp
                        className="icon"
                        color={displayColor}
                        type={x.type}
                        isCargo={x.isCargo}
                        borderWidth="2px"
                        activity={activityClass}
                        contentOverride={LISTING_GAME_ICON}
                    />
                </div>
                {pickerOpen && (
                    <Portal>
                        <div
                            ref={pickerRef}
                            style={colorMenuCss}
                            className="k45_comm_contextMenu xtm-popup-solid xtmLineColorPickerOverlay"
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
                {identityOpen && (
                    <Portal>
                        <div
                            ref={identityMenuRef}
                            style={identityMenuCss}
                            className="k45_comm_contextMenu xtm-popup-solid xtmLineIdentityPopup"
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <FocusDisabled>
                                <EditorItemRowNoFocus label={translate("lineList.edit.acronym", "Line acronym")}>
                                    <StringInputField
                                        className={editorModule.input}
                                        value={acronymDraft}
                                        onChange={setAcronymDraft}
                                        onChangeEnd={() => { void saveAcronym(); }}
                                    />
                                </EditorItemRowNoFocus>
                                <EditorItemRowNoFocus label={translate("lineList.edit.internalNumber", "Internal line number")}>
                                    <IntInput
                                        focusKey={noFocus}
                                        className={editorModule.input}
                                        value={numberDraft}
                                        onChange={setNumberDraft}
                                        onBlur={() => { void saveRouteNumber(); }}
                                    />
                                </EditorItemRowNoFocus>
                            </FocusDisabled>
                        </div>
                    </Portal>
                )}
            </div>
            <div className="lineName">
                {nameEditing ? (
                    <FocusDisabled>
                        <div className="nameInputHost" onKeyDownCapture={onNameKeyDownCapture}>
                            <EllipsisTextInput
                                ref={nameInputRef}
                                className="nameInput"
                                theme={titleTextInputTheme}
                                value={nameValue}
                                onChange={onNameChange}
                                onBlur={commitNameEdit}
                                onKeyDown={onNameKeyDown}
                                disableHint
                            />
                        </div>
                    </FocusDisabled>
                ) : (
                    <div
                        className="nameDisplay"
                        role="button"
                        onMouseDown={(e) => {
                            e.stopPropagation();
                        }}
                        onClick={startNameEdit}
                    >
                        {resolvedName}
                    </div>
                )}
            </div>
            <div className="lineType">
                <span className="typeLabel">{getNameFor(x.type, x.isCargo)}</span>
                <button
                    type="button"
                    className="neutralBtn txt detailsBtn"
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onOpenDetails(x.entity);
                    }}
                >
                    {translate("lineList.openDetails", "Details")}
                </button>
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
                    : (
                        <>
                            <span>{`${x.vehicles} ${engine.translate(`Transport.LEGEND_VEHICLES[${x.type}]`)} • `}</span>
                            <span
                                className="occupancyRange"
                                style={{ backgroundColor: occupancyCrowd.borderColor }}
                            >
                                {[
                                    LocalizedNumber.renderString(localization, {
                                        value: (x.usageMin ?? 0) * 100,
                                        unit: Unit.PercentageSingleFraction,
                                    }),
                                    LocalizedNumber.renderString(localization, {
                                        value: (x.usageMax ?? x.usage ?? 0) * 100,
                                        unit: Unit.PercentageSingleFraction,
                                    }),
                                ].join("~")}
                            </span>
                        </>
                    )}
            </div>
            <div className="scheduleColumn">
                {SCHEDULE_COLUMN_ORDER.map((key) => {
                    const isCurrent = key === activityClass;
                    return (
                        <div
                            key={key}
                            role="button"
                            className={`scheduleBtn${isCurrent ? " current" : ""}`}
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

export const LineItemCard = memo(LineItemCardCmp);
