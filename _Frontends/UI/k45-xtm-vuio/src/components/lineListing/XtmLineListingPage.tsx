import { AutoColorService } from "#service/AutoColorService";
import { LineData, LineManagementService } from "#service/LineManagementService";
import {
    SegmentOccupancyReport,
    SegmentOccupancyService,
    SimulationDateTimeJson,
} from "#service/SegmentOccupancyService";
import { TransportType } from "#enum/TransportType";
import translate from "#utility/translate";
import {
    ContextMenuButton,
    ContextMenuExpansion,
    calculateElementPosition,
    isOnArea,
    onRecalculateContextMenuPosition,
    replaceArgs,
    toVanillaEntity,
    VanillaComponentResolver,
    VanillaWidgets,
} from "@klyte45/vuio-commons";
import engine from "cohtml/cohtml";
import { transport } from "cs2/bindings";
import { FocusDisabled } from "cs2/input";
import { useLocalization } from "cs2/l10n";
import { getModule } from "cs2/modding";
import { Portal, Scrollable } from "cs2/ui";
import classNames from "classnames";
import { CSSProperties, startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LineIdentityPatch, LineItemCard } from "./LineItemCard";
import {
    ACTIVITY_ORDER,
    ACTIVITY_TO_ICONS,
    activityToLineFlags,
    DEFAULT_LINE_SORT,
    getLineActivityClass,
    LINE_SORT_KEYS,
    LineActivityClass,
    LineSort,
    LineSortKey,
    mergeLinesPreservingOrder,
    nextLineSort,
    sortAndGroupLines,
    TYPE_ORDER,
    TYPE_TO_ICONS,
} from "./lineListingTypes";
import { XtmOccupancyReportPage } from "./occupancyReport/XtmOccupancyReportPage";
import { XtmFareGroupsPage } from "./fareGroups/XtmFareGroupsPage";
import { XtmVehicleModelGroupsPage } from "./vehicleModelGroups/XtmVehicleModelGroupsPage";
import {
    getOverviewModeToken,
    getPersistedOverviewMode,
    OverviewScreenMode,
    setPersistedOverviewMode,
    subscribeOverviewMode,
} from "./overviewNavigation";
import "#styles/lineListing.scss";
import "#styles/occupancyReport.scss";
import "#styles/fareGroups.scss";
import "#styles/vehicleModelGroups.scss";

function getNameFor(type: string, isCargo: boolean) {
    return engine.translate(isCargo ? `Transport.ROUTES[${type}]` : `Transport.LINES[${type}]`);
}

function isSpecialOverviewMode(mode: OverviewScreenMode): boolean {
    return mode === "fareGroups" || mode === "vehicleModelGroups";
}

/** Yield to the browser so the overview shell can paint before heavy work. */
function yieldForPaint(): Promise<void> {
    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve());
        });
    });
}

const ACTIVITY_TOOLTIP_KEYS: Record<LineActivityClass, [string, string]> = {
    "activity-disabled": ["lineList.filterDisabled", "Disabled"],
    "activity-dayNight": ["lineList.filterDayNight", "Day & night"],
    "activity-day": ["lineList.filterDay", "Day only"],
    "activity-night": ["lineList.filterNight", "Night only"],
};

const SORT_LABEL_KEYS: Record<LineSortKey, [string, string]> = {
    routeNumber: ["lineList.sort.routeNumber", "Line number"],
    acronym: ["lineList.sort.acronym", "Line acronym"],
    length: ["lineList.sort.length", "Line length"],
    usage: ["lineList.sort.usage", "Line usage (%)"],
    cargo: ["lineList.sort.cargo", "Passengers/Cargo per month"],
    schedule: ["lineList.sort.schedule", "Scheduling state"],
};

const SORT_MENU_ICON_ASC = "coui://uil/Standard/ArrowSortHighDown.svg";
const SORT_MENU_ICON_DESC = "coui://uil/Standard/ArrowSortLowDown.svg";

const REPORT_ACTIVITY_ORDER: LineActivityClass[] = [
    "activity-dayNight",
    "activity-day",
    "activity-night",
];

const MODE_MENU_ITEMS: { mode: OverviewScreenMode; labelKey: string; fallback: string }[] = [
    { mode: "listing", labelKey: "occupancyReport.mode.listing", fallback: "Line listing" },
    { mode: "fareGroups", labelKey: "fareGroups.mode", fallback: "Fare Groups" },
    {
        mode: "vehicleModelGroups",
        labelKey: "vehicleModelGroups.mode",
        fallback: "Vehicle Model Groups",
    },
    {
        mode: "occupancyPassengers",
        labelKey: "occupancyReport.mode.occupancyPassengers",
        fallback: "Occupancy Report: Passengers",
    },
    {
        mode: "occupancyCargo",
        labelKey: "occupancyReport.mode.occupancyCargo",
        fallback: "Occupancy Report: Cargo",
    },
];

/** Survives Transportation Overview remounts / navigation within the session. */
let persistedFilterExclude: string[] = [];
let persistedActivityExclude: LineActivityClass[] = [];
let persistedSort: LineSort = DEFAULT_LINE_SORT;

function typeHasPaletteGuid(guid: string | undefined | null): boolean {
    return !!guid;
}

function isReportMode(mode: OverviewScreenMode): boolean {
    return mode === "occupancyPassengers" || mode === "occupancyCargo";
}

function formatReportDateTime(
    localization: ReturnType<typeof useLocalization>,
    value: SimulationDateTimeJson | undefined,
): string {
    if (!value) return "—";
    try {
        const formatDateTime = getModule(
            "game-ui/common/localization/localized-date.tsx",
            "formatDateTime",
        ) as (loc: typeof localization, dt: SimulationDateTimeJson) => string;
        return formatDateTime(localization, value);
    } catch {
        const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
        return `${value.year}-${pad(value.month)} ${pad(value.hour)}:${pad(value.minute)}`;
    }
}

function ModeChangeButton({
    currentMode,
    onSelectMode,
}: {
    currentMode: OverviewScreenMode;
    onSelectMode: (mode: OverviewScreenMode) => void;
}) {
    const btnRef = useRef<HTMLDivElement>(null!);
    const menuRef = useRef<HTMLDivElement>(null!);
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuCss, setMenuCss] = useState({} as CSSProperties);
    const EditorScrollable = VanillaWidgets.instance.EditorScrollable;

    useEffect(() => {
        if (!menuOpen || !btnRef.current) return;
        setMenuCss(
            onRecalculateContextMenuPosition(
                btnRef,
                calculateElementPosition(btnRef.current),
                ContextMenuExpansion.BOTTOM_LEFT,
            ),
        );
    }, [menuOpen]);

    useEffect(() => {
        if (!menuOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (isOnArea(event, btnRef)) return;
            if (isOnArea(event, menuRef)) return;
            setMenuOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside, true);
        return () => document.removeEventListener("mousedown", handleClickOutside, true);
    }, [menuOpen]);

    return (
        <div className="modeChangeBtn" ref={btnRef}>
            <button
                type="button"
                className="positiveBtn txt"
                onClick={() => setMenuOpen((v) => !v)}
            >
                {translate("occupancyReport.changeMode", "Change mode")}
            </button>
            {menuOpen && (
                <Portal>
                    <div className={classNames("k45_comm_contextMenu", "xtm-popup-solid")} style={menuCss} ref={menuRef}>
                        <div className="k45_comm_contextMenu_title">
                            {translate("occupancyReport.changeMode", "Change mode")}
                        </div>
                        <EditorScrollable style={{ maxHeight: "300rem" }}>
                            {MODE_MENU_ITEMS.map(({ mode, labelKey, fallback }) => {
                                const selected = mode === currentMode;
                                const label = translate(labelKey, fallback);
                                return (
                                    <button
                                        key={mode}
                                        type="button"
                                        className={classNames("k45_comm_contextMenu_item", selected && "disabled")}
                                        disabled={selected}
                                        onClick={() => {
                                            setMenuOpen(false);
                                            if (!selected) onSelectMode(mode);
                                        }}
                                    >
                                        {`${selected ? "✓ " : ""}${label}`}
                                    </button>
                                );
                            })}
                        </EditorScrollable>
                    </div>
                </Portal>
            )}
        </div>
    );
}

export const XtmLineListingPage = () => {
    const [linesList, setLinesList] = useState<LineData[]>([]);
    const [filterExclude, setFilterExclude] = useState(persistedFilterExclude);
    const [activityExclude, setActivityExclude] = useState(persistedActivityExclude);
    const [currentSort, setCurrentSort] = useState(persistedSort);
    const [overviewMode, setOverviewMode] = useState(getPersistedOverviewMode);
    const [passengerPalettes, setPassengerPalettes] = useState<Partial<Record<TransportType, string>>>({});
    const [cargoPalettes, setCargoPalettes] = useState<Partial<Record<TransportType, string>>>({});
    const [report, setReport] = useState<SegmentOccupancyReport | null>(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [fareGroupCount, setFareGroupCount] = useState(0);
    const [vehicleModelGroupCount, setVehicleModelGroupCount] = useState(0);
    const [linesLoaded, setLinesLoaded] = useState(false);
    const localization = useLocalization();
    const ToolButton = VanillaComponentResolver.instance.ToolButton;
    const noFocus = VanillaComponentResolver.instance.FOCUS_DISABLED;
    const reportMode = isReportMode(overviewMode);
    const fareGroupsMode = overviewMode === "fareGroups";
    const vehicleModelGroupsMode = overviewMode === "vehicleModelGroups";
    const specialMode = isSpecialOverviewMode(overviewMode);
    const cityHasNoLines = linesList.length === 0;
    const showModeChange = specialMode || !cityHasNoLines;

    useEffect(() => subscribeOverviewMode(() => {
        setOverviewMode(getPersistedOverviewMode());
        void getOverviewModeToken();
    }), []);

    // Only force listing after the city line list has loaded — an empty list during
    // the initial fetch must not wipe SIP-driven fare/model-group navigation.
    // Fare / model-group screens do not require lines, so keep them even if empty.
    useEffect(() => {
        if (!linesLoaded || !cityHasNoLines) return;
        if (isSpecialOverviewMode(overviewMode)) return;
        if (overviewMode !== "listing") {
            setPersistedOverviewMode("listing");
            setOverviewMode("listing");
        }
    }, [cityHasNoLines, overviewMode, linesLoaded]);

    const reloadLines = useCallback((res: LineData[]) => {
        setLinesLoaded(true);
        startTransition(() => {
            if (!Array.isArray(res)) {
                setLinesList([]);
                return;
            }
            setLinesList((prev) => {
                if (prev.length === 0) {
                    return sortAndGroupLines(res, persistedSort);
                }
                return mergeLinesPreservingOrder(prev, res);
            });
        });
    }, [persistedSort]);

    const patchLineActivity = useCallback((entityIndex: number, activity: LineActivityClass) => {
        const flags = activityToLineFlags(activity);
        setLinesList((prev) =>
            prev.map((line) =>
                line.entity.Index === entityIndex
                    ? {
                        ...line,
                        active: flags.active,
                        schedule: flags.active ? flags.schedule : line.schedule,
                    }
                    : line,
            ),
        );
    }, []);

    const patchLineColor = useCallback((entityIndex: number, color: string, isFixedColor: boolean) => {
        setLinesList((prev) =>
            prev.map((line) =>
                line.entity.Index === entityIndex
                    ? { ...line, color, isFixedColor }
                    : line,
            ),
        );
    }, []);

    const patchLineIdentity = useCallback((
        entityIndex: number,
        patch: LineIdentityPatch,
    ) => {
        setLinesList((prev) =>
            prev.map((line) => {
                if (line.entity.Index !== entityIndex) return line;
                const next = { ...line };
                if (patch.routeNumber !== undefined) {
                    next.routeNumber = patch.routeNumber;
                }
                if (patch.acronym !== undefined) {
                    next.xtmData = { ...(line.xtmData ?? { Acronym: "" }), Acronym: patch.acronym };
                }
                return next;
            }),
        );
    }, []);

    const onOpenLineDetails = useCallback((entity: LineData["entity"]) => {
        transport.selectLine(toVanillaEntity(entity));
    }, []);

    const onLineColorChange = useCallback((entityIndex: number, color: string, isFixedColor: boolean) => {
        patchLineColor(entityIndex, color, isFixedColor);
        if (!isFixedColor) {
            const reload = () => LineManagementService.listLines().then(reloadLines);
            window.setTimeout(reload, 100);
            window.setTimeout(reload, 400);
        }
    }, [patchLineColor, reloadLines]);

    const onLineIdentityChange = useCallback((entityIndex: number, patch: LineIdentityPatch) => {
        patchLineIdentity(entityIndex, patch);
        if (patch.routeNumber !== undefined) {
            const reload = () => LineManagementService.listLines().then(reloadLines);
            window.setTimeout(reload, 100);
            window.setTimeout(reload, 400);
        }
    }, [patchLineIdentity, reloadLines]);

    const typeUsesPalette = (type: TransportType, isCargo: boolean) =>
        typeHasPaletteGuid(isCargo ? cargoPalettes[type] : passengerPalettes[type]);

    const fetchReport = async (mode: OverviewScreenMode) => {
        if (!isReportMode(mode)) return;
        setReportLoading(true);
        try {
            const data = await SegmentOccupancyService.getCityReport(mode === "occupancyCargo");
            setReport(data ?? null);
        } catch {
            setReport(null);
        } finally {
            setReportLoading(false);
        }
    };

    useEffect(() => {
        let cancelled = false;
        const onLines = (x: LineData[]) => {
            if (!cancelled) reloadLines(x);
        };
        const reloadPaletteSettings = async () => {
            const [passenger, cargo] = await Promise.all([
                AutoColorService.passengerModalSettings(),
                AutoColorService.cargoModalSettings(),
            ]);
            if (cancelled) return;
            setPassengerPalettes(passenger ?? {});
            setCargoPalettes(cargo ?? {});
        };

        engine.whenReady.then(async () => {
            if (cancelled) return;
            engine.on("k45::xtm.lineViewer.getCityLines->", onLines);

            // Let the overview shell / special-mode page paint before heavy city-line work.
            await yieldForPaint();
            if (cancelled) return;

            const mode = getPersistedOverviewMode();
            const needsLinesNow = !isSpecialOverviewMode(mode);
            if (needsLinesNow) {
                void LineManagementService.listLines().then((res) => {
                    if (!cancelled) reloadLines(res);
                });
            }

            // Palette settings are only needed for the line listing cards.
            if (needsLinesNow) {
                void reloadPaletteSettings();
            }
            AutoColorService.doOnAutoColorSettingsChanged(() => {
                void reloadPaletteSettings();
            });

            if (isReportMode(mode)) {
                void fetchReport(mode);
            }
        });

        return () => {
            cancelled = true;
            engine.off("k45::xtm.lineViewer.getCityLines->");
        };
    }, []);

    // When leaving fare/model-group screens for listing/report, load lines if still missing.
    useEffect(() => {
        if (specialMode || linesLoaded) return;
        let cancelled = false;
        void (async () => {
            await yieldForPaint();
            if (cancelled) return;
            const res = await LineManagementService.listLines();
            if (!cancelled) reloadLines(res);
            const [passenger, cargo] = await Promise.all([
                AutoColorService.passengerModalSettings(),
                AutoColorService.cargoModalSettings(),
            ]);
            if (cancelled) return;
            setPassengerPalettes(passenger ?? {});
            setCargoPalettes(cargo ?? {});
        })();
        return () => {
            cancelled = true;
        };
    }, [specialMode, linesLoaded]);

    const toggleFilterType = (type: string) => {
        setFilterExclude((prev) => {
            const next = prev.includes(type) ? prev.filter((x) => x !== type) : [...prev, type];
            persistedFilterExclude = next;
            return next;
        });
    };

    const toggleActivityFilter = (activity: LineActivityClass) => {
        setActivityExclude((prev) => {
            const next = prev.includes(activity) ? prev.filter((x) => x !== activity) : [...prev, activity];
            persistedActivityExclude = next;
            return next;
        });
    };

    const setFilters = (types: string[], activities: LineActivityClass[]) => {
        persistedFilterExclude = types;
        persistedActivityExclude = activities;
        setFilterExclude(types);
        setActivityExclude(activities);
    };

    const onSelectSort = (key: LineSortKey) => {
        setCurrentSort((prev) => {
            const next = nextLineSort(prev, key);
            persistedSort = next;
            startTransition(() => {
                setLinesList((lines) => sortAndGroupLines(lines, next));
            });
            return next;
        });
    };

    const onSelectMode = (mode: OverviewScreenMode) => {
        setPersistedOverviewMode(mode);
        setOverviewMode(mode);
        setFilters([], []);
        if (isReportMode(mode)) {
            fetchReport(mode);
        } else {
            setReport(null);
        }
    };

    const visibleLines = useMemo(
        () =>
            linesList.filter((x) => {
                if (filterExclude.includes(`${x.type}.${x.isCargo}`)) return false;
                if (activityExclude.includes(getLineActivityClass(x))) return false;
                return true;
            }),
        [linesList, filterExclude, activityExclude],
    );

    const presentTypeKeys = useMemo(() => {
        const keys = new Set<string>();
        for (const line of linesList) {
            keys.add(`${line.type}.${line.isCargo}`);
        }
        return keys;
    }, [linesList]);

    const passengerTypeKeys = useMemo(
        () => TYPE_ORDER.filter((key) => key.endsWith(".false") && presentTypeKeys.has(key)),
        [presentTypeKeys],
    );

    const cargoTypeKeys = useMemo(
        () => TYPE_ORDER.filter((key) => key.endsWith(".true") && presentTypeKeys.has(key)),
        [presentTypeKeys],
    );

    const presentTypeOrder = useMemo(
        () => [...passengerTypeKeys, ...cargoTypeKeys],
        [passengerTypeKeys, cargoTypeKeys],
    );

    const visibleTypeKeys = useMemo(() => {
        if (overviewMode === "occupancyPassengers") return passengerTypeKeys;
        if (overviewMode === "occupancyCargo") return cargoTypeKeys;
        return presentTypeOrder;
    }, [overviewMode, passengerTypeKeys, cargoTypeKeys, presentTypeOrder]);

    const visibleActivityOrder = reportMode ? REPORT_ACTIVITY_ORDER : ACTIVITY_ORDER;

    const sortMenuItems = LINE_SORT_KEYS.map((key) => {
        const labelBase = translate(...SORT_LABEL_KEYS[key]);
        const marker = currentSort.key === key ? `${currentSort.descending ? "↓" : "↑"} ` : "";
        return {
            label: `${marker}${labelBase}`,
            action: () => onSelectSort(key),
        };
    });

    const renderTypeFilterButton = (key: string) => {
        const [type, cargoFlag] = key.split(".");
        const isCargo = cargoFlag === "true";
        return (
            <ToolButton
                key={key}
                src={TYPE_TO_ICONS[key]}
                selected={!filterExclude.includes(key)}
                tooltip={getNameFor(type, isCargo)}
                onSelect={() => toggleFilterType(key)}
                focusKey={noFocus}
            />
        );
    };

    const emptyListMessage = linesList.length === 0
        ? translate("lineList.noLinesInCity", "No lines registered in this city")
        : translate("lineList.noMatchingLines", "No matching lines");

    const reportDateTimeText = replaceArgs(
        translate("occupancyReport.dataAsOf", "Data as of {datetime}"),
        { datetime: formatReportDateTime(localization, report?.cityDateTime) },
    );

    const showPassengerTypes = !specialMode && (overviewMode === "listing" || overviewMode === "occupancyPassengers");
    const showCargoTypes = !specialMode && (overviewMode === "listing" || overviewMode === "occupancyCargo");

    // PanelContent is a KeyFocusController (single child). Vanilla overview uses one
    // AutoNavigationScope; our listing has many ActiveFocusDiv hosts (foldouts, etc.).
    // FocusDisabled stops them from registering under PanelContent.
    return (
        <FocusDisabled>
            <div className="xtm-line-listing">
                <section className="filterRow">
                    {fareGroupsMode ? (
                        <div className="screenTitleLabel">
                            {translate("fareGroups.screenTitle", "Fare Groups")}
                        </div>
                    ) : vehicleModelGroupsMode ? (
                        <div className="screenTitleLabel">
                            {translate("vehicleModelGroups.screenTitle", "Vehicle Model Groups")}
                        </div>
                    ) : (
                        <>
                            {showPassengerTypes && passengerTypeKeys.map(renderTypeFilterButton)}
                            {overviewMode === "listing" && passengerTypeKeys.length > 0 && cargoTypeKeys.length > 0 && (
                                <div className="space modalSplit" />
                            )}
                            {showCargoTypes && cargoTypeKeys.map(renderTypeFilterButton)}
                            {visibleTypeKeys.length > 0 && <div className="space" />}
                            {visibleActivityOrder.map((key) => (
                                <ToolButton
                                    key={key}
                                    src={ACTIVITY_TO_ICONS[key]}
                                    selected={!activityExclude.includes(key)}
                                    tooltip={translate(...ACTIVITY_TOOLTIP_KEYS[key])}
                                    onSelect={() => toggleActivityFilter(key)}
                                    focusKey={noFocus}
                                />
                            ))}
                            <div className="space" />
                            <button type="button" className="neutralBtn txt" onClick={() => {
                                setFilters([], []);
                            }}>
                                {translate("lineList.showAll", "Show all")}
                            </button>
                            <button
                                type="button"
                                className="neutralBtn txt"
                                onClick={() => {
                                    setFilters(visibleTypeKeys.slice(), visibleActivityOrder.slice());
                                }}
                            >
                                {translate("lineList.hideAll", "Hide all")}
                            </button>
                            {overviewMode === "listing" && (
                                <>
                                    <button
                                        type="button"
                                        className="neutralBtn txt"
                                        onClick={() => setFilters(cargoTypeKeys.slice(), activityExclude)}
                                    >
                                        {translate("lineList.passengerLines", "Passenger lines")}
                                    </button>
                                    <button
                                        type="button"
                                        className="neutralBtn txt"
                                        onClick={() => setFilters(passengerTypeKeys.slice(), activityExclude)}
                                    >
                                        {translate("lineList.cargoRoutes", "Cargo routes")}
                                    </button>
                                </>
                            )}
                            {reportMode && (
                                <>
                                    <div className="space" />
                                    <button
                                        type="button"
                                        className="neutralBtn txt"
                                        disabled={reportLoading}
                                        onClick={() => fetchReport(overviewMode)}
                                    >
                                        {translate("occupancyReport.refreshData", "Refresh data")}
                                    </button>
                                </>
                            )}
                        </>
                    )}
                    <div className="spacegrow" />
                    <div className="filterRowEnd">
                        {fareGroupsMode ? (
                            <div className="linesCountLabel">
                                {replaceArgs(translate("fareGroups.groupCount", "{count} groups"), {
                                    count: `${fareGroupCount}`,
                                })}
                            </div>
                        ) : vehicleModelGroupsMode ? (
                            <div className="linesCountLabel">
                                {replaceArgs(translate("vehicleModelGroups.groupCount", "{count} groups"), {
                                    count: `${vehicleModelGroupCount}`,
                                })}
                            </div>
                        ) : reportMode ? (
                            <div className="reportDateTimeLabel">{reportDateTimeText}</div>
                        ) : (
                            <>
                                <div className="linesCountLabel">
                                    {replaceArgs(translate("lineList.linesCurrentFilterFormat", "{LINECOUNT} lines"), {
                                        LINECOUNT: `${visibleLines.length}`,
                                    })}
                                </div>
                                <ContextMenuButton
                                    src={currentSort.descending ? SORT_MENU_ICON_DESC : SORT_MENU_ICON_ASC}
                                    tooltip={translate("lineList.sort.title", "Sort lines")}
                                    menuTitle={translate("lineList.sort.title", "Sort lines")}
                                    menuDirection={ContextMenuExpansion.BOTTOM_LEFT}
                                    menuClassName="xtm-popup-solid"
                                    menuItems={sortMenuItems}
                                    focusKey={noFocus}
                                />
                            </>
                        )}
                        {showModeChange && (
                            <>
                                <div className="modeChangeSpacer" />
                                <ModeChangeButton currentMode={overviewMode} onSelectMode={onSelectMode} />
                            </>
                        )}
                    </div>
                </section>
                {fareGroupsMode ? (
                    <section className="LineList LineList--report">
                        <div className="reportArea">
                            <XtmFareGroupsPage onGroupsChanged={setFareGroupCount} />
                        </div>
                    </section>
                ) : vehicleModelGroupsMode ? (
                    <section className="LineList LineList--report">
                        <div className="reportArea">
                            <XtmVehicleModelGroupsPage onGroupsChanged={setVehicleModelGroupCount} />
                        </div>
                    </section>
                ) : reportMode ? (
                    <section className="LineList LineList--report">
                        <div className="reportArea">
                            <XtmOccupancyReportPage
                                report={report}
                                loading={reportLoading}
                                filterExclude={filterExclude}
                                activityExclude={activityExclude}
                            />
                        </div>
                    </section>
                ) : (
                    <section className="LineList">
                        <Scrollable className="scrollArea">
                            {visibleLines.length === 0 ? (
                                <div className="emptyListMessage">{emptyListMessage}</div>
                            ) : (
                                visibleLines.flatMap((x, i, a) => [
                                    i > 0 && (a[i - 1].type !== x.type || a[i - 1].isCargo !== x.isCargo) ? (
                                        <div key={`sep_${x.entity.Index}`} className="typeSeparator" />
                                    ) : null,
                                    <LineItemCard
                                        key={x.entity.Index}
                                        lineData={x}
                                        typeUsesPalette={typeUsesPalette(x.type, x.isCargo)}
                                        onOpenDetails={onOpenLineDetails}
                                        onActivityChange={patchLineActivity}
                                        onColorChange={onLineColorChange}
                                        onIdentityChange={onLineIdentityChange}
                                    />,
                                ])
                            )}
                        </Scrollable>
                    </section>
                )}
            </div>
        </FocusDisabled>
    );
};
