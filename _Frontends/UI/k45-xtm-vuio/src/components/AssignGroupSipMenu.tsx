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
import { ManagedGroupOption } from "./ManagedGroupSipMenu";

const GEAR_ICON = "coui://uil/Standard/Gear.svg";

type Props = {
    line: Entity;
    loadGroups: () => Promise<ManagedGroupOption[]>;
    assignLine: (line: Entity, group: Entity | null) => Promise<boolean>;
    onAssigned?: () => void;
    onManageGroups?: () => void;
    manageGroupsLabel?: string;
    menuTitle: string;
    unnamedLabel?: string;
    className?: string;
};

export function AssignGroupSipMenu({
    line,
    loadGroups,
    assignLine,
    onAssigned,
    onManageGroups,
    manageGroupsLabel,
    menuTitle,
    unnamedLabel,
    className,
}: Props) {
    const [groups, setGroups] = useState<ManagedGroupOption[]>([]);
    const toolButtonTheme = VanillaComponentResolver.instance.toolButtonTheme;

    useEffect(() => {
        let cancelled = false;
        loadGroups().then((list) => {
            if (!cancelled) setGroups(list ?? []);
        });
        return () => {
            cancelled = true;
        };
    }, [loadGroups]);

    const menuItems = useMemo((): ContextButtonMenuItemArray => {
        const unnamed = unnamedLabel
            ?? translate("fareGroups.unnamed", "Unnamed group");
        const assignItems: ContextButtonMenuItemArray = groups.length === 0
            ? [{
                label: translate(
                    "managedGroups.sip.noGroupsAvailable",
                    "<No Groups available>",
                ),
                disabled: true,
            }]
            : groups.map((g) => ({
                label: g.name || unnamed,
                action: () => {
                    void assignLine(line, g.entity).then((ok) => {
                        if (ok) onAssigned?.();
                    });
                },
            }));

        if (!onManageGroups) return assignItems;

        return [
            ...assignItems,
            null,
            {
                label: manageGroupsLabel
                    ?? translate("managedGroups.sip.manageGroups", "Manage groups"),
                action: onManageGroups,
            },
        ];
    }, [groups, line, assignLine, onAssigned, onManageGroups, manageGroupsLabel, unnamedLabel]);

    return (
        <FocusDisabled>
            <ContextMenuButton
                src={GEAR_ICON}
                className={className ?? toolButtonTheme?.button}
                tooltip={translate("managedGroups.sip.menuTooltip", "Groups Options")}
                menuTitle={menuTitle}
                menuDirection={ContextMenuExpansion.BOTTOM_LEFT}
                menuClassName="xtm-popup-solid"
                menuItems={menuItems}
                focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
            />
        </FocusDisabled>
    );
}
