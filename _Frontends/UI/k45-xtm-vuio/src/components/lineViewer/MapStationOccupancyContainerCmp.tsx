import { Unit } from "#enum/Unit";
import { StationData } from "#service/LineManagementService";
import { getStopPeakHistoricalUsage } from "#utility/lineViewerUtils";
import { LocalizedNumber, useLocalization } from "cs2/l10n";

type Props = {
    /** Departure stop whose historical occupancy is shown. */
    stop: StationData;
    /** Optional direction marker for symmetric half-trip view. */
    directionArrow?: "up" | "down";
};

/**
 * Historical peak occupancy label for a stop.
 * Positioning is owned by the parent segment-info row; this only renders the label.
 */
export function MapStationOccupancyContainerCmp({ stop, directionArrow }: Props) {
    const locale = useLocalization();
    const peak = getStopPeakHistoricalUsage(stop);
    const text = LocalizedNumber.renderString(locale, {
        value: peak * 100,
        unit: Unit.Percentage,
        signed: false,
    });
    const prefix = directionArrow === "up" ? "↑ " : directionArrow === "down" ? "↓ " : "";

    return <div className="occupancyLbl">{prefix}{text}</div>;
}
