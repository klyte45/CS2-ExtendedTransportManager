import translate from "#utility/translate";
import {
    VehicleModelAvailableVehicles,
    VehicleModelGroupDetail,
    VehicleModelGroupLineShieldInfo,
    VehicleModelGroupListItem,
    VehicleModelGroupService,
    VehicleModelPresentType,
} from "#service/VehicleModelGroupService";
import {
    calculateElementPosition,
    ContextMenuExpansion,
    Entity,
    isOnArea,
    onRecalculateContextMenuPosition,
    replaceArgs,
    VanillaComponentResolver,
    VanillaWidgets,
} from "@klyte45/vuio-commons";
import engine from "cohtml/cohtml";
import { FocusDisabled } from "cs2/input";
import { ConfirmationDialog, Portal, Scrollable } from "cs2/ui";
import classNames from "classnames";
import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TYPE_ORDER, TYPE_TO_ICONS } from "#components/lineListing/lineListingTypes";
import { VehicleModelGroupEditor } from "./VehicleModelGroupEditor";
import { VehicleModelGroupListCard } from "./VehicleModelGroupListCard";
import {
    entitiesEqual,
    entityKey,
    hasAtLeastOneModel,
    sortByEntityIndex,
    transportTypeFromInt,
    typeKey,
} from "./vehicleModelGroupUtils";
import {
    consumePendingVehicleModelGroup,
    consumePendingVehicleModelType,
    getPendingVehicleModelGroupToken,
    getPendingVehicleModelTypeToken,
    subscribePendingVehicleModelGroup,
    subscribePendingVehicleModelType,
} from "../overviewNavigation";

const PLUS_ICON = "coui://uil/Standard/Plus.svg";

type SelectedType = { transportType: number; isCargo: boolean };

type Props = {
    onGroupsChanged?: (count: number) => void;
};

function typeDisplayName(transportType: number, isCargo: boolean): string {
    const typeName = transportTypeFromInt(transportType);
    return engine.translate(
        isCargo ? `Transport.ROUTES[${typeName}]` : `Transport.LINES[${typeName}]`,
    );
}

function sortPresentTypes(types: VehicleModelPresentType[]): VehicleModelPresentType[] {
    const orderIndex = new Map(TYPE_ORDER.map((k, i) => [k, i]));
    return types.slice().sort((a, b) => {
        const ka = typeKey(a.transportType, a.isCargo);
        const kb = typeKey(b.transportType, b.isCargo);
        return (orderIndex.get(ka) ?? 999) - (orderIndex.get(kb) ?? 999);
    });
}

function TypeFilterButton({
    selected,
    presentTypes,
    onSelect,
}: {
    selected: SelectedType | null;
    presentTypes: VehicleModelPresentType[];
    onSelect: (type: SelectedType) => void;
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

    const label = selected
        ? typeDisplayName(selected.transportType, selected.isCargo)
        : translate("vehicleModelGroups.typeMenu.empty", "No transport type");

    return (
        <div className="xtm-vmGroupsPage_typeBtn" ref={btnRef}>
            <button
                type="button"
                className="neutralBtn txt"
                onClick={() => setMenuOpen((v) => !v)}
                disabled={presentTypes.length === 0}
            >
                {label}
            </button>
            {menuOpen && (
                <Portal>
                    <div
                        className={classNames("k45_comm_contextMenu", "xtm-popup-solid")}
                        style={menuCss}
                        ref={menuRef}
                    >
                        <div className="k45_comm_contextMenu_title">
                            {translate(
                                "vehicleModelGroups.typeMenuTitle",
                                "Select the transport type to edit",
                            )}
                        </div>
                        <EditorScrollable style={{ maxHeight: "300rem" }}>
                            {presentTypes.map((t) => {
                                const isCurrent =
                                    !!selected &&
                                    selected.transportType === t.transportType &&
                                    selected.isCargo === t.isCargo;
                                const itemLabel = typeDisplayName(t.transportType, t.isCargo);
                                const icon = TYPE_TO_ICONS[typeKey(t.transportType, t.isCargo)];
                                return (
                                    <button
                                        key={typeKey(t.transportType, t.isCargo)}
                                        type="button"
                                        className={classNames(
                                            "k45_comm_contextMenu_item",
                                            isCurrent && "disabled",
                                        )}
                                        disabled={isCurrent}
                                        onClick={() => {
                                            setMenuOpen(false);
                                            if (!isCurrent) {
                                                onSelect({
                                                    transportType: t.transportType,
                                                    isCargo: t.isCargo,
                                                });
                                            }
                                        }}
                                    >
                                        {icon ? (
                                            <span
                                                className="xtm-vmGroupsPage_typeMenuIcon"
                                                style={{ backgroundImage: `url(${icon})` }}
                                            />
                                        ) : null}
                                        {`${isCurrent ? "✓ " : ""}${itemLabel}`}
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

export function XtmVehicleModelGroupsPage({ onGroupsChanged }: Props) {
    const ToolButton = VanillaComponentResolver.instance.ToolButton;
    const [groups, setGroups] = useState<VehicleModelGroupListItem[]>([]);
    const [presentTypes, setPresentTypes] = useState<VehicleModelPresentType[]>([]);
    const [selectedType, setSelectedType] = useState<SelectedType | null>(null);
    const [shields, setShields] = useState<VehicleModelGroupLineShieldInfo[]>([]);
    const [available, setAvailable] = useState<VehicleModelAvailableVehicles | null>(null);
    const [selected, setSelected] = useState<Entity | null>(null);
    const [detail, setDetail] = useState<VehicleModelGroupDetail | null>(null);
    const [pendingDelete, setPendingDelete] = useState<VehicleModelGroupListItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [pendingNavToken, setPendingNavToken] = useState(getPendingVehicleModelGroupToken);
    const [pendingTypeToken, setPendingTypeToken] = useState(getPendingVehicleModelTypeToken);

    const filteredGroups = useMemo(() => {
        if (!selectedType) return [];
        return groups.filter(
            (g) =>
                g.transportType === selectedType.transportType &&
                !!g.isCargo === !!selectedType.isCargo,
        );
    }, [groups, selectedType]);

    useEffect(() => {
        onGroupsChanged?.(filteredGroups.length);
    }, [filteredGroups.length, onGroupsChanged]);

    const refreshList = useCallback(async () => {
        const list = sortByEntityIndex((await VehicleModelGroupService.list()) ?? []);
        setGroups(list);
        return list;
    }, []);

    const refreshPresentTypes = useCallback(async () => {
        const types = sortPresentTypes((await VehicleModelGroupService.listPresentTypes()) ?? []);
        setPresentTypes(types);
        return types;
    }, []);

    const refreshTypeData = useCallback(async (type: SelectedType) => {
        const [shieldData, vehicles] = await Promise.all([
            VehicleModelGroupService.listShieldLines(type.transportType, type.isCargo, true),
            VehicleModelGroupService.listAvailableVehicles(type.transportType, type.isCargo),
        ]);
        setShields(shieldData ?? []);
        setAvailable(vehicles ?? { primary: [], secondary: [] });
    }, []);

    const loadDetail = useCallback(async (group: Entity) => {
        const d = await VehicleModelGroupService.detail(group);
        setDetail(d);
        setSelected(group);
    }, []);

    const selectGroup = useCallback(
        async (group: Entity) => {
            await loadDetail(group);
        },
        [loadDetail],
    );

    const openGroupFromNav = useCallback(
        async (group: Entity) => {
            const d = await VehicleModelGroupService.detail(group);
            if (!d) return;
            const type: SelectedType = {
                transportType: d.transportType,
                isCargo: !!d.isCargo,
            };
            setSelectedType(type);
            await refreshTypeData(type);
            setDetail(d);
            setSelected(group);
            await refreshList();
        },
        [refreshList, refreshTypeData],
    );

    const changeType = useCallback(
        async (type: SelectedType) => {
            setSelectedType(type);
            setSelected(null);
            setDetail(null);
            await refreshTypeData(type);
        },
        [refreshTypeData],
    );

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const [list, types] = await Promise.all([
                    VehicleModelGroupService.list(),
                    VehicleModelGroupService.listPresentTypes(),
                ]);
                if (cancelled) return;
                const groupsSorted = sortByEntityIndex(list ?? []);
                const typesSorted = sortPresentTypes(types ?? []);
                setGroups(groupsSorted);
                setPresentTypes(typesSorted);
                const initial = typesSorted[0] ?? null;
                setSelectedType(initial);
                if (initial) {
                    await refreshTypeData(initial);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => subscribePendingVehicleModelGroup(() => {
        setPendingNavToken(getPendingVehicleModelGroupToken());
    }), []);

    useEffect(() => subscribePendingVehicleModelType(() => {
        setPendingTypeToken(getPendingVehicleModelTypeToken());
    }), []);

    useEffect(() => {
        if (pendingNavToken <= 0) return;
        const group = consumePendingVehicleModelGroup();
        if (!group) return;
        void openGroupFromNav(group);
    }, [pendingNavToken, openGroupFromNav]);

    useEffect(() => {
        if (pendingTypeToken <= 0 || loading) return;
        const type = consumePendingVehicleModelType();
        if (!type) return;
        void changeType(type);
    }, [pendingTypeToken, loading, changeType]);

    const createGroup = async () => {
        if (!selectedType) return;
        const entity = await VehicleModelGroupService.create(
            selectedType.transportType,
            selectedType.isCargo,
        );
        if (!entity) return;
        await refreshList();
        await loadDetail(entity);
        await refreshTypeData(selectedType);
    };

    const confirmDelete = async (ok: boolean) => {
        const target = pendingDelete;
        setPendingDelete(null);
        if (!ok || !target) return;
        await VehicleModelGroupService.delete(target.entity);
        if (selected && entitiesEqual(selected, target.entity)) {
            setSelected(null);
            setDetail(null);
        }
        await refreshList();
        if (selectedType) await refreshTypeData(selectedType);
    };

    const patchDetail = async (patch: Partial<VehicleModelGroupDetail>) => {
        if (!detail || !selected) return;
        // Empty lines[] is intentional and saveable — only models are required.
        const next: VehicleModelGroupDetail = {
            ...detail,
            ...patch,
            entity: selected,
            models: patch.models ?? detail.models ?? [],
            lines: Array.isArray(patch.lines)
                ? patch.lines
                : Array.isArray(detail.lines)
                  ? detail.lines
                  : [],
        };
        setDetail(next);

        if (!hasAtLeastOneModel(next.models)) {
            return;
        }

        const ok = await VehicleModelGroupService.save(selected, next);
        if (ok) {
            window.setTimeout(() => {
                refreshList();
                if (selectedType) refreshTypeData(selectedType);
            }, 120);
        }
    };

    return (
        <div className="xtm-vmGroupsPage">
            <div className="xtm-vmGroupsPage_list">
                <div className="xtm-vmGroupsPage_listHeader">
                    <div className="xtm-vmGroupsPage_listTitle">
                        {translate("vehicleModelGroups.listTitle", "Groups")}
                    </div>
                    <FocusDisabled>
                        <ToolButton
                            src={PLUS_ICON}
                            selected={false}
                            tooltip={translate(
                                "vehicleModelGroups.addGroup",
                                "Add vehicle model group",
                            )}
                            onSelect={createGroup}
                            focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                            disabled={!selectedType}
                        />
                    </FocusDisabled>
                    <TypeFilterButton
                        selected={selectedType}
                        presentTypes={presentTypes}
                        onSelect={(t) => {
                            void changeType(t);
                        }}
                    />
                </div>
                <div className="xtm-vmGroupsPage_listBody">
                    {loading ? (
                        <div className="xtm-vmGroupsPage_status">
                            {translate("vehicleModelGroups.loading", "Loading…")}
                        </div>
                    ) : filteredGroups.length === 0 ? (
                        <div className="xtm-vmGroupsPage_status">
                            {translate(
                                "vehicleModelGroups.emptyList",
                                "No vehicle model groups for this type yet",
                            )}
                        </div>
                    ) : (
                        <Scrollable className="xtm-vmGroupsPage_listScroll">
                            {filteredGroups.map((g) => (
                                <VehicleModelGroupListCard
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
            <div className="xtm-vmGroupsPage_editor">
                <VehicleModelGroupEditor
                    detail={detail}
                    shields={shields}
                    groups={groups}
                    available={available}
                    onPatch={patchDetail}
                />
            </div>
            {pendingDelete && (
                <Portal>
                    <ConfirmationDialog
                        title={translate(
                            "vehicleModelGroups.delete.title",
                            "Delete vehicle model group",
                        )}
                        message={replaceArgs(
                            translate(
                                "vehicleModelGroups.delete.message",
                                'Are you sure you want to delete the vehicle model group "{name}"?',
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
