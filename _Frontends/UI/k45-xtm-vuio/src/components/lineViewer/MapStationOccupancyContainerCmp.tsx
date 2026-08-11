import { Unit } from "#enum/Unit";
import { StationData } from "#service/LineManagementService";
import translate from "#utility/translate";
import { getHistoricalUsageHourRange, getStopHistoricalUsageForHour } from "#utility/lineViewerUtils";
import { replaceArgs } from "@klyte45/vuio-commons";
import { useValue } from "cs2/api";
import { time } from "cs2/bindings";
import { LocalizedNumber, useLocalization } from "cs2/l10n";
import { Tooltip } from "cs2/ui";

type Props = {
    /** Departure stop whose historical occupancy is shown. */
    stop: StationData;
    /** Optional direction marker for symmetric half-trip view. */
    directionArrow?: "up" | "down";
};

function formatHourLabel(hour: number): string {
    const h = hour === 24 ? 0 : hour;
    return h.toFixed(0).padStart(2, "0") + ":00";
}

/**
 * Historical occupancy label for the current in-game 4h time bucket.
 * Positioning is owned by the parent segment-info row; this only renders the label.
 */
export function MapStationOccupancyContainerCmp({ stop, directionArrow }: Props) {
    const locale = useLocalization();
    const ticks = useValue(time.ticks$);
    const timeSettings = useValue(time.timeSettings$);
    const minutes = time.calculateMinutesSinceMidnightFromTicks(timeSettings, ticks);
    const hour = Math.floor(minutes / 60) % 24;
    const { startHour, endHour } = getHistoricalUsageHourRange(hour);
    const usage = getStopHistoricalUsageForHour(stop, hour);
    const text = LocalizedNumber.renderString(locale, {
        value: usage * 100,
        unit: Unit.PercentageSingleFraction,
        signed: false,
    });
    const prefix = directionArrow === "up" ? "↑ " : directionArrow === "down" ? "↓ " : "";
    const label = prefix + text;

    const tooltipBody = replaceArgs(
        translate(
            "lineViewer.occupancyTooltip",
            "Average vehicle occupancy between {startHour} and {endHour}.",
        ),
        {
            startHour: formatHourLabel(startHour),
            endHour: formatHourLabel(endHour),
        },
    );
    const tooltipHint = translate(
        "lineViewer.occupancyTooltipClickHint",
        "Click to show details.",
    );
    // Cohtml: single string children only
    const tooltipText = tooltipBody + "\n" + tooltipHint;

    return (
        <Tooltip tooltip={tooltipText} hideOnInteraction={false}>
            <div className="occupancyLbl">{label}</div>
        </Tooltip>
    );
}
