import {
    FareGroupLineMembership,
    FareGroupService,
} from "#service/FareGroupService";
import { Unit } from "#enum/Unit";
import translate from "#utility/translate";
import {
    resolveRouteSliderRightHost,
    routeSliderClasses,
    useSipAssignPortalHost,
} from "#utility/sipAssignPortal";
import { openFareGroupEditor } from "#components/lineListing/overviewNavigation";
import { AssignGroupSipMenu } from "#components/AssignGroupSipMenu";
import { ManagedGroupSipMenu } from "#components/ManagedGroupSipMenu";
import { replaceArgs, toEntityTyped, VanillaComponentResolver } from "@klyte45/vuio-commons";
import { useValue } from "cs2/api";
import { selectedInfo } from "cs2/bindings";
import { LocalizedNumber, useLocalization } from "cs2/l10n";
import { FormattedParagraphs } from "cs2/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import engine from "cohtml/cohtml";
import "#styles/ticketPriceManaged.scss";

type PolicySliderData = {
    value: number;
    range: { min: number; max: number };
    default: number;
    step: number;
    unit?: string;
};

type Props = {
    group: string;
    tooltipKeys: string[];
    tooltipTags: string[];
    sliderData: PolicySliderData;
    Original: (props: Omit<Props, "Original">) => JSX.Element;
};

function buildMembershipTooltip(membership: FareGroupLineMembership): string {
    const lines = [...(membership.lineLabels ?? [])];
    if (membership.overflowCount > 0) {
        lines.push(
            replaceArgs(
                translate("fareGroups.ticketPrice.andOthers", "... and {count} others"),
                { count: String(membership.overflowCount) },
            ),
        );
    }
    return lines.join("\n");
}

function TicketPriceUnmanaged({
    group,
    tooltipKeys,
    tooltipTags,
    sliderData,
    Original,
    lineEntity,
    loadGroups,
    onAssigned,
}: Props & {
    lineEntity: ReturnType<typeof toEntityTyped>;
    loadGroups: () => Promise<{ entity: any; name: string }[]>;
    onAssigned: () => void;
}) {
    const portalHost = useSipAssignPortalHost(
        routeSliderClasses.routeSlider,
        resolveRouteSliderRightHost,
        [lineEntity?.Index, lineEntity?.Version, sliderData?.value, sliderData?.range?.max],
    );

    return (
        <>
            <Original
                group={group}
                tooltipKeys={tooltipKeys}
                tooltipTags={tooltipTags}
                sliderData={sliderData}
            />
            {portalHost
                && createPortal(
                    <AssignGroupSipMenu
                        line={lineEntity}
                        loadGroups={loadGroups}
                        assignLine={FareGroupService.assignLine}
                        onAssigned={onAssigned}
                        menuTitle={translate(
                            "managedGroups.sip.assignFareTitle",
                            "Assign to fare group",
                        )}
                        unnamedLabel={translate("fareGroups.unnamed", "Unnamed group")}
                    />,
                    portalHost,
                )}
        </>
    );
}

export function TicketPriceSectionXtm({
    group,
    tooltipKeys,
    tooltipTags,
    sliderData,
    Original,
}: Props) {
    const selectedEntity = useValue(selectedInfo.selectedEntity$);
    const localization = useLocalization();
    const [membership, setMembership] = useState<FareGroupLineMembership | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const lineEntity = useMemo(() => toEntityTyped(selectedEntity), [selectedEntity?.index, selectedEntity?.version]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        FareGroupService.lineMembership(lineEntity)
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

    const loadGroups = useCallback(async () => {
        const list = (await FareGroupService.list()) ?? [];
        return list.map((g) => ({ entity: g.entity, name: g.name }));
    }, []);

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
                sliderData={sliderData}
            />
        );
    }

    if (!membership) {
        return (
            <TicketPriceUnmanaged
                group={group}
                tooltipKeys={tooltipKeys}
                tooltipTags={tooltipTags}
                sliderData={sliderData}
                Original={Original}
                lineEntity={lineEntity}
                loadGroups={loadGroups}
                onAssigned={() => setRefreshKey((k) => k + 1)}
            />
        );
    }

    const fareValue = Math.round(sliderData?.value ?? 0);
    const fareLabel =
        fareValue === 0
            ? translate("fareGroups.fareFree", "Free")
            : LocalizedNumber.renderString(localization, {
                value: fareValue,
                unit: Unit.Money,
                signed: false,
            });

    const managedBy = replaceArgs(
        translate(
            "fareGroups.ticketPrice.managedBy",
            "This line belongs to fare group <{name}>. Current fare: <{fare}>.\nChanging this fare will affect <{count}> lines.",
        ),
        {
            name: membership.groupName || translate("fareGroups.unnamed", "Unnamed group"),
            fare: fareLabel,
            count: String(membership.lineCount),
        },
    );

    return VanillaComponentResolver.CreateInfoSection(
        [
            {
                left: engine.translate("SelectedInfoPanel.TICKET_PRICE"),
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
                        assignLine={FareGroupService.assignLine}
                        onEditGroup={openFareGroupEditor}
                        onMembershipChanged={() => setRefreshKey((k) => k + 1)}
                        editLabel={translate("fareGroups.ticketPrice.editGroup", "Edit fare group")}
                        removeLabel={translate(
                            "fareGroups.ticketPrice.removeFromGroup",
                            "Remove from group",
                        )}
                        moveSubtitle={translate(
                            "fareGroups.ticketPrice.moveToGroup",
                            "Move to another group",
                        )}
                        unnamedLabel={translate("fareGroups.unnamed", "Unnamed group")}
                    />
                ),
            },
        ],
        membershipTooltip ?? vanillaTooltip,
    );
}
