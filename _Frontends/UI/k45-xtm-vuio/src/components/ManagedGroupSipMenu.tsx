import translate from "#utility/translate";
import {
    ContextButtonMenuItemArray,
    ContextMenuButton,
    ContextMenuExpansion,
    Entity,
    VanillaComponentResolver,
} from "@klyte45/vuio-commons";
import { FocusDisabled } from "cs2/input";
import { useEffect, useMemo, useState } from "react";

const GEAR_ICON = "coui://uil/Standard/Gear.svg";

function sameEntity(a: Entity | null | undefined, b: Entity | null | undefined): boolean {
    if (!a || !b) return !a && !b;
    return a.Index === b.Index && (a.Version ?? 0) === (b.Version ?? 0);
}

export type ManagedGroupOption = {
    entity: Entity;
    name: string;
};

type Props = {
    line: Entity;
    currentGroup: Entity;
    currentGroupName: string;
    /** Other groups the line can move to (current group may be included; it will be omitted). */
    loadGroups: () => Promise<ManagedGroupOption[]>;
    assignLine: (line: Entity, group: Entity | null) => Promise<boolean>;
    onEditGroup: (group: Entity) => void;
    onMembershipChanged?: () => void;
    className?: string;
    editLabel?: string;
    removeLabel?: string;
    moveSubtitle?: string;
    unnamedLabel?: string;
};

export function ManagedGroupSipMenu({
    line,
    currentGroup,
    currentGroupName,
    loadGroups,
    assignLine,
    onEditGroup,
    onMembershipChanged,
    className,
    editLabel,
    removeLabel,
    moveSubtitle,
    unnamedLabel,
}: Props) {
    const [groups, setGroups] = useState<ManagedGroupOption[]>([]);

    useEffect(() => {
        let cancelled = false;
        loadGroups().then((list) => {
            if (!cancelled) setGroups(list ?? []);
        });
        return () => {
            cancelled = true;
        };
    }, [loadGroups, currentGroup?.Index, currentGroup?.Version]);

    const menuItems = useMemo((): ContextButtonMenuItemArray => {
        const unnamed = unnamedLabel
            ?? translate("fareGroups.unnamed", "Unnamed group");
        const others = groups
            .filter((g) => !sameEntity(g.entity, currentGroup))
            .map((g) => ({
                label: g.name || unnamed,
                action: () => {
                    void assignLine(line, g.entity).then((ok) => {
                        if (ok) onMembershipChanged?.();
                    });
                },
            }));

        return [
            {
                label: editLabel
                    ?? translate("fareGroups.ticketPrice.editGroup", "Edit group"),
                action: () => onEditGroup(currentGroup),
            },
            {
                label: removeLabel
                    ?? translate("fareGroups.ticketPrice.removeFromGroup", "Remove from group"),
                action: () => {
                    void assignLine(line, null).then((ok) => {
                        if (ok) onMembershipChanged?.();
                    });
                },
            },
            null,
            {
                label: moveSubtitle
                    ?? translate("fareGroups.ticketPrice.moveToGroup", "Move to another group"),
                subtitle: true,
            },
            ...others,
        ];
    }, [
        groups,
        currentGroup,
        currentGroupName,
        line,
        assignLine,
        onEditGroup,
        onMembershipChanged,
        editLabel,
        removeLabel,
        moveSubtitle,
        unnamedLabel,
    ]);

    return (
        <div className="xtm-ticketPriceManaged">
            <FocusDisabled>
                <ContextMenuButton
                    src={GEAR_ICON}
                    className={className ?? "neutralBtn xtm-ticketPriceManaged_cta"}
                    tooltip={
                        currentGroupName
                        || unnamedLabel
                        || translate("fareGroups.unnamed", "Unnamed group")
                    }
                    menuDirection={ContextMenuExpansion.BOTTOM_LEFT}
                    menuClassName="xtm-popup-solid"
                    menuItems={menuItems}
                    focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                />
            </FocusDisabled>
        </div>
    );
}
