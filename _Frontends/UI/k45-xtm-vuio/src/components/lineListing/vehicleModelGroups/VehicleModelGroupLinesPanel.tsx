import { TransportType } from "#enum/TransportType";
import { TlmLineFormatCmp } from "#components/lineViewer/TlmLineFormatCmp";
import {
    ACTIVITY_ORDER,
    ACTIVITY_TO_ICONS,
    DEFAULT_LINE_SORT,
    getLineActivityClass,
    LineActivityClass,
} from "#components/lineListing/lineListingTypes";
import {
    VehicleModelGroupDetail,
    VehicleModelGroupLineShieldInfo,
    VehicleModelGroupListItem,
} from "#service/VehicleModelGroupService";
import { LineShieldInfo } from "#service/SegmentOccupancyService";
import translate from "#utility/translate";
import {
    Entity,
    nameToString,
    replaceArgs,
    VanillaComponentResolver,
} from "@klyte45/vuio-commons";
import { FocusDisabled } from "cs2/input";
import { Icon, Scrollable, Tooltip } from "cs2/ui";
import { useMemo, useState } from "react";
import {
    entitiesEqual,
    entityKey,
    isNullEntity,
} from "./vehicleModelGroupUtils";

const REMOVE_ICON = "coui://uil/Standard/XClose.svg";
const ADD_ICON = "coui://uil/Standard/ArrowUp.svg";
const ADD_ALL_ICON = "coui://uil/Standard/ArrowUp.svg";
const REMOVE_ALL_ICON = "coui://uil/Standard/Trash.svg";
const WARN_ICON = "coui://uil/Standard/ExclamationMark.svg";

const ACTIVITY_TOOLTIP_KEYS: Record<LineActivityClass, [string, string]> = {
    "activity-disabled": ["lineList.filterDisabled", "Disabled"],
    "activity-dayNight": ["lineList.filterDayNight", "Day & night"],
    "activity-day": ["lineList.filterDay", "Day only"],
    "activity-night": ["lineList.filterNight", "Night only"],
};

function orderShields(items: VehicleModelGroupLineShieldInfo[]): VehicleModelGroupLineShieldInfo[] {
    return items.slice().sort((a, b) => {
        const dir = DEFAULT_LINE_SORT.descending ? -1 : 1;
        return dir * (a.shield.routeNumber - b.shield.routeNumber);
    });
}

function normalizeShieldRow(
    raw:
        | VehicleModelGroupLineShieldInfo
        | (LineShieldInfo & {
            vehicleModelGroup?: Entity;
            active?: boolean;
            shield?: LineShieldInfo;
        }),
): VehicleModelGroupLineShieldInfo | null {
    if (!raw) return null;
    const shield = (raw as VehicleModelGroupLineShieldInfo).shield ?? (raw as LineShieldInfo);
    if (!shield?.entity) return null;
    const activeRaw = (raw as VehicleModelGroupLineShieldInfo).active;
    return {
        shield,
        vehicleModelGroup: (raw as VehicleModelGroupLineShieldInfo).vehicleModelGroup,
        active: activeRaw !== false,
    };
}

type Props = {
    detail: VehicleModelGroupDetail;
    shields: VehicleModelGroupLineShieldInfo[];
    groups: VehicleModelGroupListItem[];
    onChangeLines: (lines: Entity[]) => void;
};

export function VehicleModelGroupLinesPanel({
    detail,
    shields,
    groups,
    onChangeLines,
}: Props) {
    const ToolButton = VanillaComponentResolver.instance.ToolButton;
    const InfoSectionFoldout = VanillaComponentResolver.instance.InfoSectionFoldout;
    const [availableOpen, setAvailableOpen] = useState(false);
    const [activityExclude, setActivityExclude] = useState<LineActivityClass[]>([]);
    const [hideAssigned, setHideAssigned] = useState(false);

    const normalizedShields = useMemo(() => {
        const out: VehicleModelGroupLineShieldInfo[] = [];
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
        const map = new Map<string, VehicleModelGroupLineShieldInfo>();
        for (const s of normalizedShields) {
            map.set(entityKey(s.shield.entity), s);
        }
        return map;
    }, [normalizedShields]);

    const linkedShields = useMemo(() => {
        const items = (detail.lines ?? [])
            .map((line) => shieldByLine.get(entityKey(line)))
            .filter((x): x is VehicleModelGroupLineShieldInfo => !!x);
        return orderShields(items);
    }, [detail.lines, shieldByLine]);

    const availableShields = useMemo(() => {
        const linkedKeys = new Set((detail.lines ?? []).map(entityKey));
        const filtered = normalizedShields.filter((item) => {
            if (linkedKeys.has(entityKey(item.shield.entity))) return false;
            const activity = getLineActivityClass({
                active: item.active !== false,
                schedule: item.shield.schedule ?? 2,
            });
            if (activityExclude.includes(activity)) return false;
            const assignedElsewhere =
                !isNullEntity(item.vehicleModelGroup) &&
                !entitiesEqual(item.vehicleModelGroup, detail.entity);
            if (hideAssigned && assignedElsewhere) return false;
            return true;
        });
        return orderShields(filtered);
    }, [normalizedShields, detail.lines, detail.entity, activityExclude, hideAssigned]);

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

    const toggleActivity = (key: LineActivityClass) => {
        setActivityExclude((prev) =>
            prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key],
        );
    };

    const renderShieldChip = (
        item: VehicleModelGroupLineShieldInfo,
        mode: "linked" | "available",
    ) => {
        const line = item.shield;
        const name = nameToString(line.name) ?? "";
        const otherGroup =
            mode === "available" &&
            !isNullEntity(item.vehicleModelGroup) &&
            !entitiesEqual(item.vehicleModelGroup, detail.entity);
        const otherGroupName = otherGroup
            ? groupNameByKey.get(entityKey(item.vehicleModelGroup)) ??
              translate("vehicleModelGroups.otherGroup.unknown", "another group")
            : "";
        const tip = otherGroup
            ? `${name}\n${replaceArgs(
                translate(
                    "vehicleModelGroups.otherGroup.warning",
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
                            activity={getLineActivityClass({
                                active: item.active,
                                schedule: line.schedule,
                            })}
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
                        <Tooltip
                            tooltip={translate(
                                "vehicleModelGroups.removeLine",
                                "Remove line from group",
                            )}
                        >
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
                        <Tooltip
                            tooltip={translate(
                                "vehicleModelGroups.addLine",
                                "Add line to group",
                            )}
                        >
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
        <div
            className={[
                "xtm-fareGroupLines",
                availableOpen && "xtm-fareGroupLines--availableOpen",
            ].filter(Boolean).join(" ")}
        >
            <div className="xtm-fareGroupLines_linked">
                <div className="xtm-fareGroupLines_sectionTitle">
                    {translate("vehicleModelGroups.linkedLines", "Lines in this group")}
                </div>
                <div className="xtm-fareGroupLines_linkedBody">
                    <Scrollable className="xtm-fareGroupLines_linkedScroll">
                        <div className="xtm-fareGroupLines_shieldGrid">
                            {linkedShields.length === 0 ? (
                                <div className="xtm-fareGroupLines_empty">
                                    {translate("vehicleModelGroups.linkedEmpty", "No lines linked")}
                                </div>
                            ) : (
                                linkedShields.map((s) => renderShieldChip(s, "linked"))
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
                                    "vehicleModelGroups.removeAllLines",
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
                        "vehicleModelGroups.availableLines",
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
                                            "vehicleModelGroups.filterAssigned",
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
                                                "vehicleModelGroups.addAllFiltered",
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
                                                "vehicleModelGroups.availableEmpty",
                                                "No matching lines",
                                            )}
                                        </div>
                                    ) : (
                                        availableShields.map((s) => renderShieldChip(s, "available"))
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
