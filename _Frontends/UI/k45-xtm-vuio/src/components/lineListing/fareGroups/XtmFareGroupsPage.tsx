import translate from "#utility/translate";
import {
    FareGroupDetail,
    FareGroupListItem,
    FareGroupLineShieldInfo,
    FareGroupService,
    FareTicketSliderBounds,
} from "#service/FareGroupService";
import { Entity, replaceArgs, VanillaComponentResolver } from "@klyte45/vuio-commons";
import { FocusDisabled } from "cs2/input";
import { ConfirmationDialog, Portal, Scrollable } from "cs2/ui";
import { useCallback, useEffect, useState } from "react";
import { FareGroupEditor } from "./FareGroupEditor";
import { FareGroupListCard } from "./FareGroupListCard";
import { entitiesEqual, entityKey, findExceptionOverlapError, sortByEntityIndex } from "./fareGroupUtils";

const PLUS_ICON = "coui://uil/Standard/Plus.svg";

const DEFAULT_BOUNDS: FareTicketSliderBounds = {
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 0,
};

type Props = {
    /** Bumps when parent wants a soft refresh of group counts after edits flush. */
    refreshToken?: number;
    onGroupsChanged?: (count: number) => void;
};

export function XtmFareGroupsPage({ refreshToken = 0, onGroupsChanged }: Props) {
    const ToolButton = VanillaComponentResolver.instance.ToolButton;
    const [groups, setGroups] = useState<FareGroupListItem[]>([]);
    const [shields, setShields] = useState<FareGroupLineShieldInfo[]>([]);
    const [bounds, setBounds] = useState<FareTicketSliderBounds>(DEFAULT_BOUNDS);
    const [selected, setSelected] = useState<Entity | null>(null);
    const [detail, setDetail] = useState<FareGroupDetail | null>(null);
    const [pendingDelete, setPendingDelete] = useState<FareGroupListItem | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshList = useCallback(async () => {
        const list = sortByEntityIndex(await FareGroupService.list() ?? []);
        setGroups(list);
        onGroupsChanged?.(list.length);
        return list;
    }, [onGroupsChanged]);

    const refreshShields = useCallback(async () => {
        const data = await FareGroupService.listShieldLines(true, false, true);
        setShields(data ?? []);
    }, []);

    const loadDetail = useCallback(async (group: Entity) => {
        const d = await FareGroupService.detail(group);
        setDetail(d);
        setSelected(group);
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const [list, shieldData, slider] = await Promise.all([
                    FareGroupService.list(),
                    FareGroupService.listShieldLines(true, false, true),
                    FareGroupService.ticketSliderBounds(),
                ]);
                if (cancelled) return;
                const groups = sortByEntityIndex(list ?? []);
                setGroups(groups);
                setShields(shieldData ?? []);
                setBounds(slider ?? DEFAULT_BOUNDS);
                onGroupsChanged?.(groups.length);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (refreshToken <= 0) return;
        refreshList();
        refreshShields();
    }, [refreshToken, refreshList, refreshShields]);

    const selectGroup = async (group: Entity) => {
        await loadDetail(group);
        await refreshShields();
    };

    const createGroup = async () => {
        const entity = await FareGroupService.create();
        if (!entity) return;
        await refreshList();
        await loadDetail(entity);
        await refreshShields();
    };

    const confirmDelete = async (ok: boolean) => {
        const target = pendingDelete;
        setPendingDelete(null);
        if (!ok || !target) return;
        await FareGroupService.delete(target.entity);
        if (selected && entitiesEqual(selected, target.entity)) {
            setSelected(null);
            setDetail(null);
        }
        await refreshList();
        await refreshShields();
    };

    const patchDetail = async (patch: Partial<FareGroupDetail>) => {
        if (!detail || !selected) return;
        const next: FareGroupDetail = {
            ...detail,
            ...patch,
            entity: selected,
            exceptions: patch.exceptions ?? detail.exceptions ?? [],
            lines: patch.lines ?? detail.lines ?? [],
        };
        setDetail(next);

        if (findExceptionOverlapError(next.exceptions ?? [])) {
            return;
        }

        const ok = await FareGroupService.save(selected, next);
        if (ok) {
            // Refresh list counts after membership / fare edits (coalesced on backend).
            window.setTimeout(() => {
                refreshList();
                refreshShields();
            }, 120);
        }
    };

    return (
        <div className="xtm-fareGroupsPage">
            <div className="xtm-fareGroupsPage_list">
                <div className="xtm-fareGroupsPage_listHeader">
                    <div className="xtm-fareGroupsPage_listTitle">
                        {translate("fareGroups.listTitle", "Groups")}
                    </div>
                    <FocusDisabled>
                        <ToolButton
                            src={PLUS_ICON}
                            selected={false}
                            tooltip={translate("fareGroups.addGroup", "Add fare group")}
                            onSelect={createGroup}
                            focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                        />
                    </FocusDisabled>
                </div>
                <div className="xtm-fareGroupsPage_listBody">
                    {loading ? (
                        <div className="xtm-fareGroupsPage_status">
                            {translate("fareGroups.loading", "Loading…")}
                        </div>
                    ) : groups.length === 0 ? (
                        <div className="xtm-fareGroupsPage_status">
                            {translate("fareGroups.emptyList", "No fare groups yet")}
                        </div>
                    ) : (
                        <Scrollable className="xtm-fareGroupsPage_listScroll">
                            {groups.map((g) => (
                                <FareGroupListCard
                                    key={entityKey(g.entity)}
                                    item={g}
                                    selected={!!selected && entitiesEqual(selected, g.entity)}
                                    onSelect={() => selectGroup(g.entity)}
                                    onDelete={() => setPendingDelete(g)}
                                />
                            ))}
                        </Scrollable>
                    )}
                </div>
            </div>
            <div className="xtm-fareGroupsPage_editor">
                <FareGroupEditor
                    detail={detail}
                    shields={shields}
                    groups={groups}
                    bounds={bounds}
                    onPatch={patchDetail}
                />
            </div>
            {pendingDelete && (
                <Portal>
                    <ConfirmationDialog
                        title={translate("fareGroups.delete.title", "Delete fare group")}
                        message={replaceArgs(
                            translate(
                                "fareGroups.delete.message",
                                'Are you sure you want to delete the fare group "{name}"?',
                            ),
                            { name: pendingDelete.name },
                        )}
                        onConfirm={() => confirmDelete(true)}
                        onCancel={() => confirmDelete(false)}
                    />
                </Portal>
            )}
        </div>
    );
}
