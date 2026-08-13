import translate from "#utility/translate";
import { VehicleModelGroupListItem } from "#service/VehicleModelGroupService";
import { replaceArgs, VanillaComponentResolver } from "@klyte45/vuio-commons";
import { FocusDisabled } from "cs2/input";
import classNames from "classnames";

const DELETE_ICON = "coui://uil/Standard/Trash.svg";

type Props = {
    item: VehicleModelGroupListItem;
    selected: boolean;
    onSelect: () => void;
    onDelete: () => void;
};

export function VehicleModelGroupListCard({ item, selected, onSelect, onDelete }: Props) {
    const ToolButton = VanillaComponentResolver.instance.ToolButton;
    const metaLabel = [
        replaceArgs(translate("vehicleModelGroups.modelCount", "{count} models"), {
            count: String(item.modelCount),
        }),
        replaceArgs(translate("vehicleModelGroups.lineCount", "{count} lines"), {
            count: String(item.lineCount),
        }),
    ].join(" • ");

    return (
        <button
            type="button"
            className={classNames("xtm-vmGroupCard", selected && "selected")}
            onClick={onSelect}
        >
            <div className="xtm-vmGroupCard_main">
                <div className="xtm-vmGroupCard_name">{item.name}</div>
                <div className="xtm-vmGroupCard_meta">{metaLabel}</div>
            </div>
            <FocusDisabled>
                <div
                    className="xtm-vmGroupCard_delete"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <ToolButton
                        src={DELETE_ICON}
                        selected={false}
                        tooltip={translate("vehicleModelGroups.delete.tooltip", "Delete vehicle model group")}
                        onSelect={onDelete}
                        focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                    />
                </div>
            </FocusDisabled>
        </button>
    );
}
