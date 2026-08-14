import translate from "#utility/translate";
import {
    VehicleModelAvailableVehicles,
    VehicleModelPairDto,
    VehicleModelPrefabInfo,
} from "#service/VehicleModelGroupService";
import {
    ContextMenuButton,
    ContextMenuExpansion,
    Entity,
    VanillaComponentResolver,
} from "@klyte45/vuio-commons";
import { FocusDisabled } from "cs2/input";
import { Scrollable } from "cs2/ui";
import { useMemo, useState } from "react";
import { VehicleModelPrefabCard } from "./VehicleModelPrefabCard";
import {
    compositionPairKey,
    DEFAULT_VEHICLE_PREFAB_SORT,
    entitiesEqual,
    entityKey,
    isNullEntity,
    localizePrefabName,
    maxCompositionSlots,
    nextVehiclePrefabSort,
    nullEntity,
    sortVehiclePrefabs,
    supportsSecondary,
    VehiclePrefabSort,
    VehiclePrefabSortKey,
    VEHICLE_PREFAB_SORT_KEYS,
    wagonSingleLengthBounds,
} from "./vehicleModelGroupUtils";

const PLUS_ICON = "coui://uil/Standard/Plus.svg";
const REMOVE_ICON = "coui://uil/Standard/Trash.svg";
const SORT_MENU_ICON_ASC = "coui://uil/Standard/ArrowSortHighDown.svg";
const SORT_MENU_ICON_DESC = "coui://uil/Standard/ArrowSortLowDown.svg";

const SORT_LABEL_KEYS: Record<VehiclePrefabSortKey, [string, string]> = {
    name: ["vehicleModelGroups.sort.name", "Name"],
    capacity: ["vehicleModelGroups.sort.capacity", "Capacity"],
    length: ["vehicleModelGroups.sort.length", "Total length"],
};

type Props = {
    transportType: number;
    isCargo: boolean;
    models: VehicleModelPairDto[];
    available: VehicleModelAvailableVehicles | null;
    onChangeModels: (models: VehicleModelPairDto[]) => void;
};

export function VehicleModelCompositionsPanel({
    transportType,
    isCargo,
    models,
    available,
    onChangeModels,
}: Props) {
    const ToolButton = VanillaComponentResolver.instance.ToolButton;
    const canSecondary = supportsSecondary(transportType, isCargo);
    const [editIndex, setEditIndex] = useState<number | null>(
        models.length > 0 ? 0 : null,
    );
    const [prefabSort, setPrefabSort] = useState<VehiclePrefabSort>(DEFAULT_VEHICLE_PREFAB_SORT);

    // Vanilla ListVehicles: non-MU engines → secondary list, carriages → primary list.
    // Our DTO keeps primaryPrefab=engine, secondaryPrefab=carriage — swap UI groups when needed.
    const railListsSwapped = canSecondary && (available?.secondary?.length ?? 0) > 0;
    const engineOptions = railListsSwapped
        ? (available?.secondary ?? [])
        : (available?.primary ?? []);
    const carriageOptions = railListsSwapped
        ? (available?.primary ?? [])
        : (available?.secondary ?? []);
    const showCarriagePicker = canSecondary && carriageOptions.length > 0;

    const engineByKey = useMemo(() => {
        const map = new Map<string, VehicleModelPrefabInfo>();
        for (const p of engineOptions) {
            map.set(entityKey(p.entity), p);
        }
        return map;
    }, [engineOptions]);

    const carriageByKey = useMemo(() => {
        const map = new Map<string, VehicleModelPrefabInfo>();
        for (const p of carriageOptions) {
            map.set(entityKey(p.entity), p);
        }
        return map;
    }, [carriageOptions]);

    const activeIndex =
        editIndex != null && editIndex >= 0 && editIndex < models.length ? editIndex : null;
    const active = activeIndex != null ? models[activeIndex] : null;

    const pairTakenElsewhere = (
        index: number,
        primary: Entity | null | undefined,
        secondary: Entity | null | undefined,
    ) => {
        if (isNullEntity(primary) && isNullEntity(secondary)) return false;
        const key = compositionPairKey(primary, secondary);
        return models.some(
            (m, i) =>
                i !== index
                && compositionPairKey(m.primaryPrefab, m.secondaryPrefab) === key,
        );
    };

    const isPrimaryDisabled = (prefab: Entity) => {
        if (activeIndex == null || !active) return true;
        if (entitiesEqual(active.primaryPrefab, prefab)) return false;
        return pairTakenElsewhere(activeIndex, prefab, active.secondaryPrefab);
    };

    const isSecondaryDisabled = (prefab: Entity) => {
        if (activeIndex == null || !active) return true;
        if (entitiesEqual(active.secondaryPrefab, prefab)) return false;
        return pairTakenElsewhere(activeIndex, active.primaryPrefab, prefab);
    };

    const sortedEngines = useMemo(
        () => sortVehiclePrefabs(engineOptions, prefabSort, (info) => isPrimaryDisabled(info.entity)),
        [engineOptions, prefabSort, activeIndex, active, models],
    );
    const sortedCarriages = useMemo(
        () => sortVehiclePrefabs(carriageOptions, prefabSort, (info) => isSecondaryDisabled(info.entity)),
        [carriageOptions, prefabSort, activeIndex, active, models],
    );

    const maxSlots = maxCompositionSlots(
        engineOptions.length,
        carriageOptions.length,
        showCarriagePicker,
    );
    const atCompositionLimit = maxSlots <= 0 || models.length >= maxSlots;
    const compositionsTitle = `${translate("vehicleModelGroups.compositions", "Compositions")} (${models.length}/${maxSlots})`;

    const activeEngineInfo =
        active && !isNullEntity(active.primaryPrefab)
            ? engineByKey.get(entityKey(active.primaryPrefab)) ?? null
            : null;
    const activeCarriageInfo =
        active && !isNullEntity(active.secondaryPrefab)
            ? carriageByKey.get(entityKey(active.secondaryPrefab)) ?? null
            : null;
    const wagonLengthBounds = useMemo(
        () => wagonSingleLengthBounds(carriageOptions),
        [carriageOptions],
    );

    const prefabLabel = (entity: Entity | null | undefined, map: Map<string, VehicleModelPrefabInfo>) => {
        if (isNullEntity(entity)) return "—";
        const name = map.get(entityKey(entity))?.name;
        if (!name) return `#${entity!.Index}`;
        return localizePrefabName(name);
    };

    const addComposition = () => {
        if (atCompositionLimit) return;
        const next = [
            ...models,
            { primaryPrefab: nullEntity(), secondaryPrefab: nullEntity() },
        ];
        onChangeModels(next);
        setEditIndex(next.length - 1);
    };

    const removeComposition = (index: number) => {
        const next = models.filter((_, i) => i !== index);
        onChangeModels(next);
        if (next.length === 0) {
            setEditIndex(null);
        } else if (editIndex == null || editIndex >= next.length) {
            setEditIndex(next.length - 1);
        } else if (editIndex > index) {
            setEditIndex(editIndex - 1);
        }
    };

    const patchActive = (patch: Partial<VehicleModelPairDto>) => {
        if (activeIndex == null) return;
        const next = models.map((m, i) => (i === activeIndex ? { ...m, ...patch } : m));
        onChangeModels(next);
    };

    const togglePrimary = (prefab: Entity) => {
        if (activeIndex == null || !active) return;
        if (entitiesEqual(active.primaryPrefab, prefab)) {
            patchActive({ primaryPrefab: nullEntity() });
            return;
        }
        if (pairTakenElsewhere(activeIndex, prefab, active.secondaryPrefab)) return;
        patchActive({ primaryPrefab: prefab });
    };

    const toggleSecondary = (prefab: Entity) => {
        if (activeIndex == null || !active) return;
        if (entitiesEqual(active.secondaryPrefab, prefab)) {
            patchActive({ secondaryPrefab: nullEntity() });
            return;
        }
        if (pairTakenElsewhere(activeIndex, active.primaryPrefab, prefab)) return;
        patchActive({ secondaryPrefab: prefab });
    };

    const onSelectSort = (key: VehiclePrefabSortKey) => {
        setPrefabSort((prev) => nextVehiclePrefabSort(prev, key));
    };

    const sortMenuItems = VEHICLE_PREFAB_SORT_KEYS.map((key) => {
        const labelBase = translate(...SORT_LABEL_KEYS[key]);
        const marker = prefabSort.key === key ? `${prefabSort.descending ? "↓" : "↑"} ` : "";
        return {
            label: `${marker}${labelBase}`,
            action: () => onSelectSort(key),
        };
    });

    return (
        <div className="xtm-vmCompositions">
            <div className="xtm-vmCompositions_header">
                <div className="xtm-vmCompositions_title">
                    {compositionsTitle}
                </div>
                <FocusDisabled>
                    <ToolButton
                        src={PLUS_ICON}
                        selected={false}
                        tooltip={translate("vehicleModelGroups.addComposition", "Add composition")}
                        onSelect={addComposition}
                        focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                        disabled={atCompositionLimit}
                    />
                </FocusDisabled>
            </div>
            <div className="xtm-vmCompositions_list">
                {models.length === 0 ? (
                    <div className="xtm-vmCompositions_listBody">
                        <div className="xtm-vmCompositions_empty">
                            {translate(
                                "vehicleModelGroups.compositionsEmpty",
                                "No compositions yet — add one to pick vehicles",
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="xtm-vmCompositions_listBody">
                        <Scrollable className="xtm-vmCompositions_listScroll" trackVisibility="scrollable">
                        {models.map((model, index) => {
                            const selected = index === activeIndex;
                            const label = showCarriagePicker
                                ? `${prefabLabel(model.primaryPrefab, engineByKey)} + ${prefabLabel(model.secondaryPrefab, carriageByKey)}`
                                : prefabLabel(model.primaryPrefab, engineByKey);
                            return (
                                <div
                                    key={`comp_${index}`}
                                    className={[
                                        "xtm-vmCompositionRow",
                                        selected && "selected",
                                    ].filter(Boolean).join(" ")}
                                >
                                    <button
                                        type="button"
                                        className="xtm-vmCompositionRow_main"
                                        onClick={() => setEditIndex(index)}
                                    >
                                        <span className="xtm-vmCompositionRow_index">{`#${index + 1}`}</span>
                                        <span className="xtm-vmCompositionRow_label">{label}</span>
                                    </button>
                                    <div className="xtm-vmCompositionRow_remove">
                                        <FocusDisabled>
                                            <ToolButton
                                                src={REMOVE_ICON}
                                                selected={false}
                                                tooltip={translate(
                                                    "vehicleModelGroups.removeComposition",
                                                    "Remove composition",
                                                )}
                                                onSelect={() => removeComposition(index)}
                                                focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                                            />
                                        </FocusDisabled>
                                    </div>
                                </div>
                            );
                        })}
                        </Scrollable>
                    </div>
                )}
            </div>
            {activeIndex != null && active && (
                <div className="xtm-vmCompositions_picker">
                    <div className="xtm-vmCompositions_pickerHeader">
                        <div className="xtm-vmCompositions_pickerTitle">
                            {showCarriagePicker
                                ? translate("vehicleModelGroups.pickPrimary", "Pick engine / primary")
                                : translate("vehicleModelGroups.pickVehicle", "Pick vehicle")}
                        </div>
                        <FocusDisabled>
                            <ContextMenuButton
                                src={prefabSort.descending ? SORT_MENU_ICON_DESC : SORT_MENU_ICON_ASC}
                                tooltip={translate("vehicleModelGroups.sort.title", "Sort vehicles")}
                                menuTitle={translate("vehicleModelGroups.sort.title", "Sort vehicles")}
                                menuDirection={ContextMenuExpansion.BOTTOM_LEFT}
                                menuClassName="xtm-popup-solid"
                                menuItems={sortMenuItems}
                                focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                            />
                        </FocusDisabled>
                    </div>
                    <Scrollable className={"xtm-vmCompositions_pickerScroll"+(showCarriagePicker?"Multi":"")}>
                        <div className="xtm-vmCompositions_cardGrid">
                            {sortedEngines.map((info) => (
                                <VehicleModelPrefabCard
                                    key={entityKey(info.entity)}
                                    info={info}
                                    isCargo={isCargo}
                                    selected={entitiesEqual(active.primaryPrefab, info.entity)}
                                    disabled={isPrimaryDisabled(info.entity)}
                                    onToggle={() => togglePrimary(info.entity)}
                                    railPairLengthMode={showCarriagePicker}
                                    pairedCarriage={activeCarriageInfo}
                                    wagonLengthBounds={wagonLengthBounds}
                                />
                            ))}
                        </div>
                    </Scrollable>
                    {showCarriagePicker && (
                        <>
                            <div className="xtm-vmCompositions_pickerTitle">
                                {translate("vehicleModelGroups.pickCarriage", "Pick carriage")}
                            </div>
                            <Scrollable className="xtm-vmCompositions_pickerScrollMulti">
                                <div className="xtm-vmCompositions_cardGrid">
                                    {sortedCarriages.map((info) => (
                                        <VehicleModelPrefabCard
                                            key={entityKey(info.entity)}
                                            info={info}
                                            isCargo={isCargo}
                                            selected={entitiesEqual(active.secondaryPrefab, info.entity)}
                                            disabled={isSecondaryDisabled(info.entity)}
                                            onToggle={() => toggleSecondary(info.entity)}
                                            railPairLengthMode={showCarriagePicker}
                                            pairedEngine={activeEngineInfo}
                                            wagonLengthBounds={wagonLengthBounds}
                                        />
                                    ))}
                                </div>
                            </Scrollable>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
