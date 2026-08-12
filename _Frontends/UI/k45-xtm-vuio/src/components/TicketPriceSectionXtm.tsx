import {
    FareGroupLineMembership,
    FareGroupService,
} from "#service/FareGroupService";
import { Unit } from "#enum/Unit";
import translate from "#utility/translate";
import { openFareGroupEditor } from "#components/lineListing/overviewNavigation";
import { replaceArgs, toEntityTyped, VanillaComponentResolver } from "@klyte45/vuio-commons";
import { useValue } from "cs2/api";
import { selectedInfo } from "cs2/bindings";
import { LocalizedNumber, LocalizedString, useLocalization } from "cs2/l10n";
import { FormattedParagraphs } from "cs2/ui";
import { useEffect, useMemo, useState } from "react";
import engine from "cohtml/cohtml";

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

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        FareGroupService.lineMembership(toEntityTyped(selectedEntity))
            .then((data) => {
                if (!cancelled) setMembership(data);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [selectedEntity?.index, selectedEntity?.version]);

    const vanillaTooltip = selectedInfo.useGeneratedTooltipParagraphs(group, tooltipTags, tooltipKeys);
    const ToolButton = VanillaComponentResolver.instance.ToolButton;

    const membershipTooltip = useMemo(() => {
        if (!membership) return null;
        const text = buildMembershipTooltip(membership);
        return text ? <FormattedParagraphs text={text} /> : null;
    }, [membership]);

    if (loading || !membership) {
        return (
            <Original
                group={group}
                tooltipKeys={tooltipKeys}
                tooltipTags={tooltipTags}
                sliderData={sliderData}
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
            "This line belongs to fare group {name}. Current fare: {fare}. Changing this fare will affect {count} lines.",
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
                // Same locale ID Loc.SelectedInfoLabel.TICKET_PRICE resolves to in vanilla.
                left: (
                    engine.translate("SelectedInfoPanel.TICKET_PRICE")
                ),
                uppercase: true,
            },
            {
                left: (
                    <FormattedParagraphs text={managedBy} />
                ),
                right:
                    <ToolButton
                        src="coui://uil/Standard/Pencil.svg"
                        className="neutralBtn xtm-ticketPriceManaged_cta"
                        onClick={() => openFareGroupEditor(membership.group)}
                        tooltip={translate("fareGroups.ticketPrice.editGroup", "Edit fare group")}
                    />

            },
        ],
        membershipTooltip ?? vanillaTooltip,
    );
}
