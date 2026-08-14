import { Unit } from "#enum/Unit";
import translate from "#utility/translate";
import { FareGroupListItem } from "#service/FareGroupService";
import { replaceArgs, VanillaComponentResolver } from "@klyte45/vuio-commons";
import { FocusDisabled } from "cs2/input";
import { LocalizedNumber, useLocalization } from "cs2/l10n";
import classNames from "classnames";

const DELETE_ICON = "coui://uil/Standard/Trash.svg";

type Props = {
    item: FareGroupListItem;
    selected: boolean;
    onSelect: () => void;
    onDelete: () => void;
};

export function FareGroupListCard({ item, selected, onSelect, onDelete }: Props) {
    const localization = useLocalization();
    const ToolButton = VanillaComponentResolver.instance.ToolButton;
    const fareLabel =
        item.defaultFare === 0
            ? translate("fareGroups.fareFree", "Free")
            : LocalizedNumber.renderString(localization, {
                value: Math.round(item.defaultFare),
                unit: Unit.Money,
                signed: false,
            });
    const metaLabel = `${fareLabel} • ${replaceArgs(translate("fareGroups.lineCount", "{count} lines"), {
        count: String(item.lineCount),
    })}`;

    return (
        <button
            type="button"
            className={classNames("xtm-fareGroupCard", selected && "selected")}
            onClick={onSelect}
        >
            <div className="xtm-fareGroupCard_main">
                <div className="xtm-fareGroupCard_name">{item.name}</div>
                <div className="xtm-fareGroupCard_meta">{metaLabel}</div>
            </div>
            <FocusDisabled>
                <div
                    className="xtm-fareGroupCard_delete"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <ToolButton
                        src={DELETE_ICON}
                        selected={false}
                        tooltip={translate("fareGroups.delete.tooltip", "Delete fare group")}
                        onSelect={onDelete}
                        focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                    />
                </div>
            </FocusDisabled>
        </button>
    );
}
