import { TransportType } from "#enum/TransportType";
import { TlmLineFormatCmp } from "#components/lineViewer/TlmLineFormatCmp";
import {
    ACTIVITY_ORDER,
    ACTIVITY_TO_ICONS,
    DEFAULT_LINE_SORT,
    getLineActivityClass,
    groupLinesByTransportType,
    LineActivityClass,
    TYPE_ORDER,
    TYPE_TO_ICONS,
} from "#components/lineListing/lineListingTypes";
import {
    FareGroupDetail,
    FareGroupLineShieldInfo,
    FareGroupListItem,
} from "#service/FareGroupService";
import { LineShieldInfo } from "#service/SegmentOccupancyService";
import translate from "#utility/translate";
import {
    Entity,
    nameToString,
    replaceArgs,
    VanillaComponentResolver,
} from "@klyte45/vuio-commons";
import engine from "cohtml/cohtml";
import { FocusDisabled } from "cs2/input";
import { Icon, Scrollable, Tooltip } from "cs2/ui";
import { useMemo, useState } from "react";
import { entitiesEqual, entityKey, isNullEntity } from "./fareGroupUtils";

const REMOVE_ICON = "coui://uil/Standard/XClose.svg";
const ADD_ICON = "coui://uil/Standard/ArrowUp.svg";
const ADD_ALL_ICON = "coui://uil/Standard/Plus.svg";
const REMOVE_ALL_ICON = "coui://uil/Standard/Trash.svg";
const WARN_ICON = "coui://uil/Standard/ExclamationMark.svg";

const PASSENGER_TYPE_ORDER = TYPE_ORDER.filter((k) => k.endsWith(".false"));
const ACTIVITY_TOOLTIP_KEYS: Record<LineActivityClass, [string, string]> = {
    "activity-disabled": ["lineList.filterDisabled", "Disabled"],
    "activity-dayNight": ["lineList.filterDayNight", "Day & night"],
    "activity-day": ["lineList.filterDay", "Day only"],
    "activity-night": ["lineList.filterNight", "Night only"],
};

function getNameFor(type: string, isCargo: boolean) {
    return engine.translate(isCargo ? `Transport.ROUTES[${type}]` : `Transport.LINES[${type}]`);
}

function orderShieldsForListing(items: FareGroupLineShieldInfo[]): FareGroupLineShieldInfo[] {
    const byRoute = items.slice().sort((a, b) => {
        const dir = DEFAULT_LINE_SORT.descending ? -1 : 1;
        return dir * (a.shield.routeNumber - b.shield.routeNumber);
    });
    return groupLinesByTransportType(
        byRoute.map((item) => ({
            ...item,
            type: item.shield.type,
            isCargo: !!item.shield.isCargo,
        })),
    );
}

function renderShieldGridItems(
    items: FareGroupLineShieldInfo[],
    renderChip: (item: FareGroupLineShieldInfo) => JSX.Element,
    keyPrefix: string,
) {
    return items.flatMap((s, i, a) => {
        const prev = i > 0 ? a[i - 1] : null;
        const showSep =
            !!prev &&
            (prev.shield.type !== s.shield.type ||
                !!prev.shield.isCargo !== !!s.shield.isCargo);
        return [
            showSep ? (
                <div
                    key={`${keyPrefix}sep_${entityKey(s.shield.entity)}`}
                    className="xtm-fareGroupLines_typeSeparator"
                />
            ) : null,
            renderChip(s),
        ];
    });
}

/** Cohtml may nest shield or flatten fields; normalize either shape. */
function normalizeShieldRow(raw: FareGroupLineShieldInfo | (LineShieldInfo & { fareGroup?: Entity; active?: boolean; shield?: LineShieldInfo })): FareGroupLineShieldInfo | null {
    if (!raw) return null;
    const shield = (raw as FareGroupLineShieldInfo).shield ?? (raw as LineShieldInfo);
    if (!shield?.entity) return null;
    const activeRaw = (raw as FareGroupLineShieldInfo).active;
    return {
        shield,
        fareGroup: (raw as FareGroupLineShieldInfo).fareGroup,
        active: activeRaw !== false,
    };
}

type Props = {
    detail: FareGroupDetail;
    shields: FareGroupLineShieldInfo[];
    groups: FareGroupListItem[];
    onChangeLines: (lines: Entity[]) => void;
};

export function FareGroupLinesPanel({ detail, shields, groups, onChangeLines }: Props) {
    const ToolButton = VanillaComponentResolver.instance.ToolButton;
    const InfoSectionFoldout = VanillaComponentResolver.instance.InfoSectionFoldout;
    const [availableOpen, setAvailableOpen] = useState(false);
    const [filterExclude, setFilterExclude] = useState<string[]>([]);
    const [activityExclude, setActivityExclude] = useState<LineActivityClass[]>([]);
    const [hideAssigned, setHideAssigned] = useState(false);

    const normalizedShields = useMemo(() => {
        const out: FareGroupLineShieldInfo[] = [];
        for (const raw of shields ?? []) {
            const n = normalizeShieldRow(raw);
            if (n) out.push(n);
        }
        return out;
    }, [shields]);

    const groupNameByKey = useMemo(() => {
        const map = new Map<string, string>();
        for (const g of groups) {
            map.set(entityKey(g.entity), g.name);
        }
        return map;
    }, [groups]);

    const shieldByLine = useMemo(() => {
        const map = new Map<string, FareGroupLineShieldInfo>();
        for (const s of normalizedShields) {
            map.set(entityKey(s.shield.entity), s);
        }
        return map;
    }, [normalizedShields]);

    const linkedShields = useMemo(() => {
        const items = (detail.lines ?? [])
            .map((line) => shieldByLine.get(entityKey(line)))
            .filter((x): x is FareGroupLineShieldInfo => !!x);
        return orderShieldsForListing(items);
    }, [detail.lines, shieldByLine]);

    const availableShields = useMemo(() => {
        const linkedKeys = new Set((detail.lines ?? []).map(entityKey));
        const filtered = normalizedShields.filter((item) => {
            if (item.shield.isCargo) return false;
            if (linkedKeys.has(entityKey(item.shield.entity))) return false;
            const typeKey = `${item.shield.type}.${item.shield.isCargo}`;
            if (filterExclude.includes(typeKey)) return false;
            const activity = getLineActivityClass({
                active: item.active !== false,
                schedule: item.shield.schedule ?? 2,
            });
            if (activityExclude.includes(activity)) return false;
            const assignedElsewhere =
                !isNullEntity(item.fareGroup) &&
                !entitiesEqual(item.fareGroup, detail.entity);
            if (hideAssigned && assignedElsewhere) return false;
            return true;
        });
        return orderShieldsForListing(filtered);
    }, [normalizedShields, detail.lines, detail.entity, filterExclude, activityExclude, hideAssigned]);

    const presentPassengerTypes = useMemo(() => {
        const keys = new Set<string>();
        for (const s of normalizedShields) {
            if (!s.shield.isCargo) keys.add(`${s.shield.type}.false`);
        }
        return PASSENGER_TYPE_ORDER.filter((k) => keys.has(k));
    }, [normalizedShields]);

    const removeLine = (line: Entity) => {
        onChangeLines((detail.lines ?? []).filter((l) => !entitiesEqual(l, line)));
    };

    const addLine = (line: Entity) => {
        const current = detail.lines ?? [];
        if (current.some((l) => entitiesEqual(l, line))) return;
        onChangeLines([...current, line]);
    };

    const addAllFiltered = () => {
        if (availableShields.length === 0) return;
        const current = detail.lines ?? [];
        const linkedKeys = new Set(current.map(entityKey));
        const toAdd = availableShields
            .map((s) => s.shield.entity)
            .filter((line) => !linkedKeys.has(entityKey(line)));
        if (toAdd.length === 0) return;
        onChangeLines([...current, ...toAdd]);
    };

    const removeAllLinked = () => {
        if ((detail.lines ?? []).length === 0) return;
        onChangeLines([]);
    };

    const toggleType = (key: string) => {
        setFilterExclude((prev) =>
            prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key],
        );
    };

    const toggleActivity = (key: LineActivityClass) => {
        setActivityExclude((prev) =>
            prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key],
        );
    };

    const renderShieldChip = (
        item: FareGroupLineShieldInfo,
        mode: "linked" | "available",
    ) => {
        const line = item.shield;
        const name = nameToString(line.name) ?? "";
        const otherGroup =
            mode === "available" &&
            !isNullEntity(item.fareGroup) &&
            !entitiesEqual(item.fareGroup, detail.entity);
        const otherGroupName = otherGroup
            ? groupNameByKey.get(entityKey(item.fareGroup)) ??
              translate("fareGroups.otherGroup.unknown", "another group")
            : "";
        const tip = otherGroup
            ? `${name}\n${replaceArgs(
                translate(
                    "fareGroups.otherGroup.warning",
                    "Belongs to {group}. Adding it here will remove it from that group.",
                ),
                { group: otherGroupName },
            )}`
            : name;

        return (
            <div key={entityKey(line.entity)} className="xtm-fareGroupShield">
                <Tooltip tooltip={tip}>
                    <div className="xtm-fareGroupShield_face">
                        <TlmLineFormatCmp
                            color={line.color}
                            type={line.type as TransportType}
                            isCargo={!!line.isCargo}
                            text={line.xtmData?.Acronym || String(line.routeNumber)}
                            className="xtm-fareGroupShield_format"
                        />
                        {otherGroup && (
                            <div className="xtm-fareGroupShield_warn">
                                <Icon
                                    src={WARN_ICON}
                                    tinted
                                    className="xtm-fareGroupShield_warnIcon"
                                />
                            </div>
                        )}
                    </div>
                </Tooltip>
                {mode === "linked" ? (
                    <div className="xtm-fareGroupShield_action xtm-fareGroupShield_action--remove">
                        <Tooltip tooltip={translate("fareGroups.removeLine", "Remove line from group")}>
                            <button
                                type="button"
                                className="xtm-fareGroupShield_actionBtn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeLine(line.entity);
                                }}
                            >
                                <Icon src={REMOVE_ICON} tinted className="xtm-fareGroupShield_actionIcon" />
                            </button>
                        </Tooltip>
                    </div>
                ) : (
                    <div className="xtm-fareGroupShield_action xtm-fareGroupShield_action--add">
                        <Tooltip tooltip={translate("fareGroups.addLine", "Add line to group")}>
                            <button
                                type="button"
                                className="xtm-fareGroupShield_actionBtn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    addLine(line.entity);
                                }}
                            >
                                <Icon src={ADD_ICON} tinted className="xtm-fareGroupShield_actionIcon" />
                            </button>
                        </Tooltip>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={["xtm-fareGroupLines", availableOpen && "xtm-fareGroupLines--availableOpen"].filter(Boolean).join(" ")}>
            <div className="xtm-fareGroupLines_linked">
                <div className="xtm-fareGroupLines_sectionTitle">
                    {translate("fareGroups.linkedLines", "Lines in this group")}
                </div>
                <div className="xtm-fareGroupLines_linkedBody">
                    <Scrollable className="xtm-fareGroupLines_linkedScroll">
                        <div className="xtm-fareGroupLines_shieldGrid">
                            {linkedShields.length === 0 ? (
                                <div className="xtm-fareGroupLines_empty">
                                    {translate("fareGroups.linkedEmpty", "No lines linked")}
                                </div>
                            ) : (
                                renderShieldGridItems(
                                    linkedShields,
                                    (s) => renderShieldChip(s, "linked"),
                                    "linked_",
                                )
                            )}
                        </div>
                    </Scrollable>
                </div>
                {linkedShields.length > 0 && (
                    <div className="xtm-fareGroupLines_linkedFooter">
                        <FocusDisabled>
                            <ToolButton
                                src={REMOVE_ALL_ICON}
                                selected={false}
                                tooltip={translate(
                                    "fareGroups.removeAllLines",
                                    "Remove all lines from this group",
                                )}
                                onSelect={removeAllLinked}
                                focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                            />
                        </FocusDisabled>
                    </div>
                )}
            </div>
            <div className="xtm-fareGroupLines_available">
                <InfoSectionFoldout
                    header={translate(
                        "fareGroups.availableLines",
                        "Available lines to link to this group",
                    )}
                    initialExpanded={false}
                    disableFocus
                    className="xtm-fareGroupLines_foldout"
                    onToggleExpanded={(expanded) => setAvailableOpen(expanded)}
                >
                    <div className="xtm-fareGroupLines_availableBody">
                        <div className="xtm-fareGroupLines_filters">
                            <div className="xtm-fareGroupLines_filtersMain">
                                <FocusDisabled>
                                    {presentPassengerTypes.map((key) => {
                                        const [type] = key.split(".");
                                        return (
                                            <ToolButton
                                                key={key}
                                                src={TYPE_TO_ICONS[key]}
                                                selected={!filterExclude.includes(key)}
                                                tooltip={getNameFor(type, false)}
                                                onSelect={() => toggleType(key)}
                                                focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                                            />
                                        );
                                    })}
                                    <div className="xtm-fareGroupLines_filterSpace" />
                                    {ACTIVITY_ORDER.map((key) => (
                                        <ToolButton
                                            key={key}
                                            src={ACTIVITY_TO_ICONS[key]}
                                            selected={!activityExclude.includes(key)}
                                            tooltip={translate(...ACTIVITY_TOOLTIP_KEYS[key])}
                                            onSelect={() => toggleActivity(key)}
                                            focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                                        />
                                    ))}
                                    <div className="xtm-fareGroupLines_filterSpace" />
                                    <ToolButton
                                        src={WARN_ICON}
                                        selected={!hideAssigned}
                                        tooltip={translate(
                                            "fareGroups.filterAssigned",
                                            "Lines already assigned to a group",
                                        )}
                                        onSelect={() => setHideAssigned((v) => !v)}
                                        focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                                    />
                                </FocusDisabled>
                            </div>
                            {availableShields.length > 0 && (
                                <div className="xtm-fareGroupLines_filtersActions">
                                    <FocusDisabled>
                                        <ToolButton
                                            src={ADD_ALL_ICON}
                                            selected={false}
                                            tooltip={translate(
                                                "fareGroups.addAllFiltered",
                                                "Add all filtered lines to this group",
                                            )}
                                            onSelect={addAllFiltered}
                                            focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                                        />
                                    </FocusDisabled>
                                </div>
                            )}
                        </div>
                        <div className="xtm-fareGroupLines_availableList">
                            <Scrollable className="xtm-fareGroupLines_availableScroll">
                                <div className="xtm-fareGroupLines_shieldGrid">
                                    {availableShields.length === 0 ? (
                                        <div className="xtm-fareGroupLines_empty">
                                            {translate(
                                                "fareGroups.availableEmpty",
                                                "No matching lines",
                                            )}
                                        </div>
                                    ) : (
                                        renderShieldGridItems(
                                            availableShields,
                                            (s) => renderShieldChip(s, "available"),
                                            "avail_",
                                        )
                                    )}
                                </div>
                            </Scrollable>
                        </div>
                    </div>
                </InfoSectionFoldout>
            </div>
        </div>
    );
}
