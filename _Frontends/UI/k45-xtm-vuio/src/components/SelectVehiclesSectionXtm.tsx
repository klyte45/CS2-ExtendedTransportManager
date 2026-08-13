import {
    VehicleModelGroupLineMembership,
    VehicleModelGroupService,
} from "#service/VehicleModelGroupService";
import translate from "#utility/translate";
import {
    resolveInfoRowRightHostNear,
    useSipAssignPortalHost,
} from "#utility/sipAssignPortal";
import { openVehicleModelGroupEditor, openVehicleModelGroupsScreen } from "#components/lineListing/overviewNavigation";
import { AssignGroupSipMenu } from "#components/AssignGroupSipMenu";
import { ManagedGroupSipMenu } from "#components/ManagedGroupSipMenu";
import { localizePrefabName } from "#components/lineListing/vehicleModelGroups/vehicleModelGroupUtils";
import { replaceArgs, toEntityTyped, VanillaComponentResolver } from "@klyte45/vuio-commons";
import { useValue } from "cs2/api";
import { selectedInfo } from "cs2/bindings";
import { getModule } from "cs2/modding";
import { FormattedParagraphs } from "cs2/ui";
import classNames from "classnames";
import { ComponentType, useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import "#styles/ticketPriceManaged.scss";

type VehiclePrefab = {
    entity: { Index: number; Version?: number };
    id: string;
    thumbnail: string;
    objectRequirementIcons?: string[];
};

type Props = {
    group: string;
    tooltipKeys: string[];
    tooltipTags: string[];
    routePrefab?: number;
    selectedPrimaryVehicles?: VehiclePrefab[];
    selectedSecondaryVehicles?: VehiclePrefab[];
    availablePrimaryVehicles?: VehiclePrefab[];
    availableSecondaryVehicles?: VehiclePrefab[] | null;
    Original: (props: Omit<Props, "Original">) => JSX.Element;
};

const selectVehiclesClasses = getModule(
    "game-ui/game/components/selected-info-panel/selected-info-sections/route-sections/select-vehicles-section/select-vehicles-section.module.scss",
    "classes",
) as {
    dropdown: string;
    dropdownLabel: string;
    wrapbox: string;
    item: string;
    pill: string;
    thumb: string;
    label: string;
};

/** Vanilla Loc: SELECT_VEHICLE_PRIMARY[routePrefabName] via hash = routePrefab. */
const Loc = getModule(
    "game-ui/common/localization/loc.generated.ts",
    "Loc",
) as {
    SelectedInfoPanel: {
        SELECT_VEHICLE_PRIMARY: ComponentType<{ hash?: number }>;
    };
};

function buildMembershipTooltip(membership: VehicleModelGroupLineMembership): string {
    const lines = [...(membership.lineLabels ?? [])];
    if (membership.overflowCount > 0) {
        lines.push(
            replaceArgs(
                translate("vehicleModelGroups.selectVehicles.andOthers", "... and {count} others"),
                { count: String(membership.overflowCount) },
            ),
        );
    }
    return lines.join("\n");
}

function VehiclePills({ vehicles }: { vehicles: VehiclePrefab[] | null | undefined }) {
    if (!vehicles?.length) return null;
    return (
        <div className={selectVehiclesClasses.wrapbox}>
            {vehicles.map((v) => (
                <div
                    key={`${v.entity?.Index}_${v.entity?.Version ?? 0}`}
                    className={classNames(selectVehiclesClasses.item, selectVehiclesClasses.pill)}
                >
                    <img src={v.thumbnail} className={selectVehiclesClasses.thumb} alt="" />
                    {v.objectRequirementIcons?.map((icon, i) => (
                        <img key={i} src={icon} className={selectVehiclesClasses.thumb} alt="" />
                    ))}
                    <div className={selectVehiclesClasses.label}>
                        {localizePrefabName(v.id)}
                    </div>
                </div>
            ))}
        </div>
    );
}

function SelectVehiclesUnmanaged({
    group,
    tooltipKeys,
    tooltipTags,
    routePrefab,
    selectedPrimaryVehicles,
    selectedSecondaryVehicles,
    availablePrimaryVehicles,
    availableSecondaryVehicles,
    Original,
    lineEntity,
    lineType,
    loadGroups,
    onAssigned,
}: Props & {
    lineEntity: ReturnType<typeof toEntityTyped>;
    lineType: { transportType: number; isCargo: boolean } | null;
    loadGroups: () => Promise<{ entity: any; name: string }[]>;
    onAssigned: () => void;
}) {
    const portalHost = useSipAssignPortalHost(
        selectVehiclesClasses.dropdown,
        (section) => resolveInfoRowRightHostNear(section, selectVehiclesClasses.dropdown),
        [
            lineEntity?.Index,
            lineEntity?.Version,
            routePrefab,
            selectedPrimaryVehicles?.length,
            availablePrimaryVehicles?.length,
        ],
    );

    return (
        <>
            <Original
                group={group}
                tooltipKeys={tooltipKeys}
                tooltipTags={tooltipTags}
                routePrefab={routePrefab}
                selectedPrimaryVehicles={selectedPrimaryVehicles}
                selectedSecondaryVehicles={selectedSecondaryVehicles}
                availablePrimaryVehicles={availablePrimaryVehicles}
                availableSecondaryVehicles={availableSecondaryVehicles}
            />
            {portalHost
                && createPortal(
                    <AssignGroupSipMenu
                        line={lineEntity}
                        loadGroups={loadGroups}
                        assignLine={VehicleModelGroupService.assignLine}
                        onAssigned={onAssigned}
                        onManageGroups={() => openVehicleModelGroupsScreen(lineType)}
                        manageGroupsLabel={translate(
                            "managedGroups.sip.manageModelGroups",
                            "Manage vehicle model groups",
                        )}
                        menuTitle={translate(
                            "managedGroups.sip.assignModelsTitle",
                            "Assign to vehicle model group",
                        )}
                        unnamedLabel={translate(
                            "vehicleModelGroups.unnamed",
                            "Unnamed vehicle model group",
                        )}
                    />,
                    portalHost,
                )}
        </>
    );
}

export function SelectVehiclesSectionXtm({
    group,
    tooltipKeys,
    tooltipTags,
    routePrefab,
    selectedPrimaryVehicles,
    selectedSecondaryVehicles,
    availablePrimaryVehicles,
    availableSecondaryVehicles,
    Original,
}: Props) {
    const selectedEntity = useValue(selectedInfo.selectedEntity$);
    const [membership, setMembership] = useState<VehicleModelGroupLineMembership | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [lineType, setLineType] = useState<{ transportType: number; isCargo: boolean } | null>(null);

    const lineEntity = useMemo(
        () => toEntityTyped(selectedEntity),
        [selectedEntity?.index, selectedEntity?.version],
    );

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        VehicleModelGroupService.lineMembership(lineEntity)
            .then((data) => {
                if (!cancelled) setMembership(data);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [lineEntity?.Index, lineEntity?.Version, refreshKey]);

    useEffect(() => {
        if (membership) {
            setLineType({
                transportType: membership.transportType,
                isCargo: membership.isCargo,
            });
            return;
        }
        let cancelled = false;
        VehicleModelGroupService.lineTypeInfo(lineEntity).then((info) => {
            if (!cancelled) setLineType(info);
        });
        return () => {
            cancelled = true;
        };
    }, [lineEntity?.Index, lineEntity?.Version, membership?.transportType, membership?.isCargo, membership]);

    const loadGroups = useCallback(async () => {
        const list = (await VehicleModelGroupService.list()) ?? [];
        const transportType = membership?.transportType ?? lineType?.transportType;
        const isCargo = membership?.isCargo ?? lineType?.isCargo;
        return list
            .filter(
                (g) =>
                    transportType == null
                    || (g.transportType === transportType && !!g.isCargo === !!isCargo),
            )
            .map((g) => ({ entity: g.entity, name: g.name }));
    }, [membership?.transportType, membership?.isCargo, lineType?.transportType, lineType?.isCargo]);

    const vanillaTooltip = selectedInfo.useGeneratedTooltipParagraphs(group, tooltipTags, tooltipKeys);

    const membershipTooltip = useMemo(() => {
        if (!membership) return null;
        const text = buildMembershipTooltip(membership);
        return text ? <FormattedParagraphs text={text} /> : null;
    }, [membership]);

    if (loading) {
        return (
            <Original
                group={group}
                tooltipKeys={tooltipKeys}
                tooltipTags={tooltipTags}
                routePrefab={routePrefab}
                selectedPrimaryVehicles={selectedPrimaryVehicles}
                selectedSecondaryVehicles={selectedSecondaryVehicles}
                availablePrimaryVehicles={availablePrimaryVehicles}
                availableSecondaryVehicles={availableSecondaryVehicles}
            />
        );
    }

    if (!membership) {
        return (
            <SelectVehiclesUnmanaged
                group={group}
                tooltipKeys={tooltipKeys}
                tooltipTags={tooltipTags}
                routePrefab={routePrefab}
                selectedPrimaryVehicles={selectedPrimaryVehicles}
                selectedSecondaryVehicles={selectedSecondaryVehicles}
                availablePrimaryVehicles={availablePrimaryVehicles}
                availableSecondaryVehicles={availableSecondaryVehicles}
                Original={Original}
                lineEntity={lineEntity}
                lineType={lineType}
                loadGroups={loadGroups}
                onAssigned={() => setRefreshKey((k) => k + 1)}
            />
        );
    }

    const managedBy = replaceArgs(
        translate(
            "vehicleModelGroups.selectVehicles.managedBy",
            "This line belongs to vehicle model group <{name}>.\nChanging these models will affect <{count}> lines.",
        ),
        {
            name: membership.groupName
                || translate("vehicleModelGroups.unnamed", "Unnamed vehicle model group"),
            count: String(membership.lineCount),
        },
    );

    return (
        <>
            {VanillaComponentResolver.CreateInfoSection(
                [
                    {
                        left: <Loc.SelectedInfoPanel.SELECT_VEHICLE_PRIMARY hash={routePrefab} />,
                        uppercase: true,
                    },
                    {
                        left: <FormattedParagraphs text={managedBy} />,
                        right: (
                            <ManagedGroupSipMenu
                                line={lineEntity}
                                currentGroup={membership.group}
                                currentGroupName={membership.groupName}
                                loadGroups={loadGroups}
                                assignLine={VehicleModelGroupService.assignLine}
                                onEditGroup={openVehicleModelGroupEditor}
                                onMembershipChanged={() => setRefreshKey((k) => k + 1)}
                                editLabel={translate(
                                    "vehicleModelGroups.selectVehicles.editGroup",
                                    "Edit vehicle model group",
                                )}
                                removeLabel={translate(
                                    "vehicleModelGroups.selectVehicles.removeFromGroup",
                                    "Remove from group",
                                )}
                                moveSubtitle={translate(
                                    "vehicleModelGroups.selectVehicles.moveToGroup",
                                    "Move to another group",
                                )}
                                unnamedLabel={translate(
                                    "vehicleModelGroups.unnamed",
                                    "Unnamed vehicle model group",
                                )}
                            />
                        ),
                    },
                ],
                membershipTooltip ?? vanillaTooltip,
            )}
            <VehiclePills vehicles={selectedPrimaryVehicles} />
            <VehiclePills vehicles={selectedSecondaryVehicles} />
        </>
    );
}
