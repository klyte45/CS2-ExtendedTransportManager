import { Unit } from "#enum/Unit";
import translate from "#utility/translate";
import { VehicleModelPrefabInfo } from "#service/VehicleModelGroupService";
import { replaceArgs } from "@klyte45/vuio-commons";
import { LocalizedNumber, useLocalization } from "cs2/l10n";
import { getModule } from "cs2/modding";
import classNames from "classnames";
import { localizePrefabName } from "./vehicleModelGroupUtils";

const handleThumbnailError = getModule(
    "game-ui/common/utils/thumbnails-errors.ts",
    "handleThumbnailError",
) as (event: { currentTarget: HTMLImageElement }) => void;

type Props = {
    info: VehicleModelPrefabInfo;
    selected: boolean;
    isCargo: boolean;
    disabled?: boolean;
    onToggle: () => void;
};

export function VehicleModelPrefabCard({
    info,
    selected,
    isCargo,
    disabled,
    onToggle,
}: Props) {
    const localization = useLocalization();
    const thumbSrc = info.imageUrl || null;
    const capacityLabel =
        info.capacity > 0
            ? isCargo
                ? LocalizedNumber.renderString(localization, {
                    value: info.capacity,
                    unit: Unit.Weight,
                    signed: false,
                })
                : LocalizedNumber.renderString(localization, {
                    value: info.capacity,
                    unit: Unit.Integer,
                    signed: false,
                })
            : null;

    const hasMesh =
        (info.meshWidth ?? 0) > 0 || (info.meshHeight ?? 0) > 0 || (info.meshDepth ?? 0) > 0;
    const meshLabel = hasMesh
        ? replaceArgs(
            translate("vehicleModelGroups.meshSize", "{w} × {h} × {d}"),
            {
                w: formatDim(info.meshWidth),
                h: formatDim(info.meshHeight),
                d: formatDim(info.meshDepth),
            },
        )
        : null;

    return (
        <button
            type="button"
            className={classNames(
                "xtm-vmPrefabCard",
                selected && "selected",
                disabled && "disabled",
            )}
            disabled={disabled && !selected}
            onClick={onToggle}
        >
            <div className="xtm-vmPrefabCard_thumb">
                {thumbSrc && (
                    <img
                        className="xtm-vmPrefabCard_thumbImg"
                        src={thumbSrc}
                        alt=""
                        onError={handleThumbnailError}
                    />
                )}
            </div>
            <div className="xtm-vmPrefabCard_body">
                <div className="xtm-vmPrefabCard_name">{localizePrefabName(info.name) || "—"}</div>
                {info.isSecondary && (
                    <div className="xtm-vmPrefabCard_badge">
                        {translate("vehicleModelGroups.carriage", "Carriage")}
                    </div>
                )}
                {capacityLabel && (
                    <div className="xtm-vmPrefabCard_row">
                        {replaceArgs(translate("vehicleModelGroups.capacity", "Capacity: {value}"), {
                            value: capacityLabel,
                        })}
                    </div>
                )}
                {info.compositionDescriptor && (
                    <div className="xtm-vmPrefabCard_row">
                        {replaceArgs(
                            translate(
                                "vehicleModelGroups.compositionUnits",
                                "Composition units: {value}",
                            ),
                            { value: info.compositionDescriptor },
                        )}
                    </div>
                )}
                {meshLabel && (
                    <div className="xtm-vmPrefabCard_row">
                        {replaceArgs(translate("vehicleModelGroups.mesh", "Size: {value}"), {
                            value: meshLabel,
                        })}
                    </div>
                )}
            </div>
        </button>
    );
}

function formatDim(value: number): string {
    if (!value || value <= 0) return "0";
    return value.toFixed(1);
}
