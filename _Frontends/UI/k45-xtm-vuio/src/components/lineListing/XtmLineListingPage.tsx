import { AutoColorService } from "#service/AutoColorService";
import { LineData, LineManagementService } from "#service/LineManagementService";
import { TransportType } from "#enum/TransportType";
import translate from "#utility/translate";
import {
    ContextMenuButton,
    ContextMenuExpansion,
    replaceArgs,
    toVanillaEntity,
    VanillaComponentResolver,
} from "@klyte45/vuio-commons";
import engine from "cohtml/cohtml";
import { transport } from "cs2/bindings";
import { FocusDisabled } from "cs2/input";
import { Scrollable } from "cs2/ui";
import { useEffect, useMemo, useState } from "react";
import { LineItemCard } from "./LineItemCard";
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
import "#styles/lineListing.scss";

function getNameFor(type: string, isCargo: boolean) {
    return engine.translate(isCargo ? `Transport.ROUTES[${type}]` : `Transport.LINES[${type}]`);
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

function typeHasPaletteGuid(guid: string | undefined | null): boolean {
    return !!guid;
}

export const XtmLineListingPage = () => {
    const [linesList, setLinesList] = useState<LineData[]>([]);
    const [filterExclude, setFilterExclude] = useState<string[]>([]);
    const [activityExclude, setActivityExclude] = useState<LineActivityClass[]>([]);
    const [currentSort, setCurrentSort] = useState<LineSort>(DEFAULT_LINE_SORT);
    const [passengerPalettes, setPassengerPalettes] = useState<Partial<Record<TransportType, string>>>({});
    const [cargoPalettes, setCargoPalettes] = useState<Partial<Record<TransportType, string>>>({});
    const ToolButton = VanillaComponentResolver.instance.ToolButton;

    const reloadLines = (res: LineData[]) => {
        if (!Array.isArray(res)) {
            setLinesList([]);
            return;
        }
        setLinesList((prev) => {
            if (prev.length === 0) {
                return sortAndGroupLines(res, DEFAULT_LINE_SORT);
            }
            return mergeLinesPreservingOrder(prev, res);
        });
    };

    const patchLineActivity = (entityIndex: number, activity: LineActivityClass) => {
        const flags = activityToLineFlags(activity);
        setLinesList((prev) =>
            prev.map((line) =>
                line.entity.Index === entityIndex
                    ? {
                        ...line,
                        active: flags.active,
                        // Keep prior schedule when disabling so engine value stays until refresh
                        schedule: flags.active ? flags.schedule : line.schedule,
                    }
                    : line,
            ),
        );
    };

    const patchLineColor = (entityIndex: number, color: string, isFixedColor: boolean) => {
        setLinesList((prev) =>
            prev.map((line) =>
                line.entity.Index === entityIndex
                    ? { ...line, color, isFixedColor }
                    : line,
            ),
        );
    };

    const patchLineIdentity = (
        entityIndex: number,
        patch: { acronym?: string; routeNumber?: number },
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
    };

    const typeUsesPalette = (type: TransportType, isCargo: boolean) =>
        typeHasPaletteGuid(isCargo ? cargoPalettes[type] : passengerPalettes[type]);

    useEffect(() => {
        const onLines = (x: LineData[]) => reloadLines(x);
        const reloadPaletteSettings = async () => {
            const [passenger, cargo] = await Promise.all([
                AutoColorService.passengerModalSettings(),
                AutoColorService.cargoModalSettings(),
            ]);
            setPassengerPalettes(passenger ?? {});
            setCargoPalettes(cargo ?? {});
        };
        engine.whenReady.then(async () => {
            engine.on("k45::xtm.lineViewer.getCityLines->", onLines);
            LineManagementService.listLines().then(reloadLines);
            await reloadPaletteSettings();
            AutoColorService.doOnAutoColorSettingsChanged(() => {
                reloadPaletteSettings();
            });
        });
        return () => {
            engine.off("k45::xtm.lineViewer.getCityLines->");
        };
    }, []);

    const toggleFilterType = (type: string) => {
        setFilterExclude((prev) => {
            if (prev.includes(type)) return prev.filter((x) => x !== type);
            return [...prev, type];
        });
    };

    const toggleActivityFilter = (activity: LineActivityClass) => {
        setActivityExclude((prev) => {
            if (prev.includes(activity)) return prev.filter((x) => x !== activity);
            return [...prev, activity];
        });
    };

    const onSelectSort = (key: LineSortKey) => {
        setCurrentSort((prev) => {
            const next = nextLineSort(prev, key);
            setLinesList((lines) => sortAndGroupLines(lines, next));
            return next;
        });
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

    const sortMenuItems = LINE_SORT_KEYS.map((key) => {
        const labelBase = translate(...SORT_LABEL_KEYS[key]);
        const marker = currentSort.key === key ? `${currentSort.descending ? "↓" : "↑"} ` : "";
        return {
            label: `${marker}${labelBase}`,
            action: () => onSelectSort(key),
        };
    });

    return (
        <div className="xtm-line-listing">
            <section className="filterRow">
                <FocusDisabled>
                    {Object.entries(TYPE_TO_ICONS).map(([key, icon]) => {
                        const [type, cargoFlag] = key.split(".");
                        const isCargo = cargoFlag === "true";
                        return (
                            <ToolButton
                                key={key}
                                src={icon}
                                selected={!filterExclude.includes(key)}
                                tooltip={getNameFor(type, isCargo)}
                                onSelect={() => toggleFilterType(key)}
                            />
                        );
                    })}
                    <div className="space" />
                    {ACTIVITY_ORDER.map((key) => (
                        <ToolButton
                            key={key}
                            src={ACTIVITY_TO_ICONS[key]}
                            selected={!activityExclude.includes(key)}
                            tooltip={translate(...ACTIVITY_TOOLTIP_KEYS[key])}
                            onSelect={() => toggleActivityFilter(key)}
                        />
                    ))}
                    <div className="space" />
                    <button type="button" className="neutralBtn txt" onClick={() => {
                        setFilterExclude([]);
                        setActivityExclude([]);
                    }}>
                        {translate("lineList.showAll", "Show all")}
                    </button>
                    <button
                        type="button"
                        className="neutralBtn txt"
                        onClick={() => {
                            setFilterExclude(TYPE_ORDER.slice());
                            setActivityExclude(ACTIVITY_ORDER.slice());
                        }}
                    >
                        {translate("lineList.hideAll", "Hide all")}
                    </button>
                    <button
                        type="button"
                        className="neutralBtn txt"
                        onClick={() => setFilterExclude(TYPE_ORDER.filter((x) => x.endsWith(".true")))}
                    >
                        {translate("lineList.passengerLines", "Passenger lines")}
                    </button>
                    <button
                        type="button"
                        className="neutralBtn txt"
                        onClick={() => setFilterExclude(TYPE_ORDER.filter((x) => x.endsWith(".false")))}
                    >
                        {translate("lineList.cargoRoutes", "Cargo routes")}
                    </button>
                    <div className="spacegrow" />
                    <div className="filterRowEnd">
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
                            focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                        />
                    </div>
                </FocusDisabled>
            </section>
            <section className="LineList">
                <Scrollable className="scrollArea">
                    {visibleLines.flatMap((x, i, a) => [
                        i > 0 && (a[i - 1].type !== x.type || a[i - 1].isCargo !== x.isCargo) ? (
                            <div key={`sep_${i}`} className="typeSeparator" />
                        ) : null,
                        <LineItemCard
                            key={`${x.entity.Index}_${i}`}
                            lineData={x}
                            typeUsesPalette={typeUsesPalette(x.type, x.isCargo)}
                            onOpenDetails={() => transport.selectLine(toVanillaEntity(x.entity))}
                            onActivityChange={(activity) => patchLineActivity(x.entity.Index, activity)}
                            onColorChange={(color, isFixedColor) => {
                                patchLineColor(x.entity.Index, color, isFixedColor);
                                if (!isFixedColor) {
                                    // setIgnorePalette uses EndFrameBarrier + palette update; reload after apply
                                    const reload = () => LineManagementService.listLines().then(reloadLines);
                                    window.setTimeout(reload, 100);
                                    window.setTimeout(reload, 400);
                                }
                            }}
                            onIdentityChange={(patch) => {
                                patchLineIdentity(x.entity.Index, patch);
                                if (patch.routeNumber !== undefined) {
                                    // Route number can reassign palette color via EndFrameBarrier
                                    const reload = () => LineManagementService.listLines().then(reloadLines);
                                    window.setTimeout(reload, 100);
                                    window.setTimeout(reload, 400);
                                }
                            }}
                        />,
                    ])}
                </Scrollable>
            </section>
        </div>
    );
};
