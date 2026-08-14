import { Unit } from "#enum/Unit";
import translate from "#utility/translate";
import { VehicleModelPrefabInfo } from "#service/VehicleModelGroupService";
import { LocalizedNumber, useLocalization } from "cs2/l10n";
import { getModule } from "cs2/modding";
import { Tooltip } from "cs2/ui";
import classNames from "classnames";
import { localizePrefabName, formatPairedCompositionLength, prefabSingleLength, prefabTotalLength } from "./vehicleModelGroupUtils";

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
    /** Engine + carriage picker: show unit length and paired total length chips. */
    railPairLengthMode?: boolean;
    pairedEngine?: VehicleModelPrefabInfo | null;
    pairedCarriage?: VehicleModelPrefabInfo | null;
    /** Min/max single wagon length among available carriages (for engine-only LEN range). */
    wagonLengthBounds?: { min: number; max: number } | null;
};

type StatKind = "cap" | "units" | "len" | "ulen";

type StatChipProps = {
    kind: StatKind;
    label: string;
    value: string;
    unit: string;
    tooltip: string;
};

function StatChip({ kind, label, value, unit, tooltip }: StatChipProps) {
    return (
        <Tooltip tooltip={tooltip}>
            <div className={classNames("xtm-vmStatChip", `xtm-vmStatChip--${kind}`)}>
                <div className="xtm-vmStatChip_label">{label}</div>
                <div className="xtm-vmStatChip_value">{value}</div>
                <div className="xtm-vmStatChip_unit">{unit}</div>
            </div>
        </Tooltip>
    );
}

export function VehicleModelPrefabCard({
    info,
    selected,
    isCargo,
    disabled,
    onToggle,
    railPairLengthMode,
    pairedEngine,
    pairedCarriage,
    wagonLengthBounds,
}: Props) {
    const localization = useLocalization();
    const thumbSrc = info.imageUrl || null;
    const lengthUnit = translate("vehicleModelGroups.stat.unit.meters", "m");
    const unknownLength = "?";

    const formatLength = (value: number | null | undefined): string | null => {
        if (value == null || value <= 0) return null;
        return (
            LocalizedNumber.renderString(localization, {
                value,
                unit: Unit.FloatTwoFractions,
                signed: false,
            }) ?? formatDim(value)
        );
    };

    const capacityValue =
        info.capacity > 0
            ? LocalizedNumber.renderString(localization, {
                value: info.capacity,
                unit: Unit.Integer,
                signed: false,
            })
            : null;
    const capacityUnit = isCargo
        ? translate("vehicleModelGroups.stat.unit.weight", "kg")
        : translate("vehicleModelGroups.stat.unit.pax", "pax");
    const capacityTooltip = isCargo
        ? translate("vehicleModelGroups.stat.cap.tooltipCargo", "Cargo capacity")
        : translate("vehicleModelGroups.stat.cap.tooltip", "Passenger capacity");

    const engineInfo = info.isSecondary ? pairedEngine : info;
    const carriageInfo = info.isSecondary ? info : pairedCarriage;
    const simpleTotalLength = prefabTotalLength(info);
    const unitLengthValue = formatLength(prefabSingleLength(info)) ?? unknownLength;
    const pairedTotalLengthValue = railPairLengthMode
        ? formatPairedCompositionLength(
            engineInfo,
            carriageInfo,
            wagonLengthBounds,
            (value) => formatLength(value),
            unknownLength,
        )
        : unknownLength;
    const simpleTotalLengthValue = formatLength(simpleTotalLength > 0 ? simpleTotalLength : null);

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
                <div className="xtm-vmPrefabCard_stats">
                    {capacityValue && (
                        <StatChip
                            kind="cap"
                            label={translate("vehicleModelGroups.stat.cap", "CAP")}
                            value={capacityValue}
                            unit={capacityUnit}
                            tooltip={capacityTooltip}
                        />
                    )}
                    {info.compositionDescriptor && (
                        <StatChip
                            kind="units"
                            label={translate("vehicleModelGroups.stat.units", "UNITS")}
                            value={info.compositionDescriptor}
                            unit={translate("vehicleModelGroups.stat.unit.cars", "cars")}
                            tooltip={translate(
                                "vehicleModelGroups.stat.units.tooltip",
                                "Composition unit count",
                            )}
                        />
                    )}
                    {railPairLengthMode ? (
                        <>
                            <StatChip
                                kind="ulen"
                                label={translate("vehicleModelGroups.stat.len.unit", "ULEN")}
                                value={unitLengthValue}
                                unit={lengthUnit}
                                tooltip={translate(
                                    "vehicleModelGroups.stat.len.unit.tooltip",
                                    "Single vehicle length",
                                )}
                            />
                            <StatChip
                                kind="len"
                                label={translate("vehicleModelGroups.stat.len", "LEN")}
                                value={pairedTotalLengthValue}
                                unit={lengthUnit}
                                tooltip={translate(
                                    "vehicleModelGroups.stat.len.paired.tooltip",
                                    "Total composition length: units × (engine + wagons × (cars − 1))",
                                )}
                            />
                        </>
                    ) : (
                        simpleTotalLengthValue != null && (
                            <StatChip
                                kind="len"
                                label={translate("vehicleModelGroups.stat.len", "LEN")}
                                value={simpleTotalLengthValue}
                                unit={lengthUnit}
                                tooltip={translate(
                                    "vehicleModelGroups.stat.len.tooltip",
                                    "Total vehicle length",
                                )}
                            />
                        )
                    )}
                </div>
            </div>
        </button>
    );
}

function formatDim(value: number): string {
    if (!value || value <= 0) return "0";
    return value.toFixed(1);
}
