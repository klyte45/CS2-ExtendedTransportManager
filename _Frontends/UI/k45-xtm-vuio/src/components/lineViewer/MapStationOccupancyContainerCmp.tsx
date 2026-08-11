import { Unit } from "#enum/Unit";
import { SegmentOccupancyDisplayMode, StationData } from "#service/LineManagementService";
import translate from "#utility/translate";
import {
    getCrowdnessBorderStyle,
    getHistoricalUsageHourRange,
    getSegmentOccupancyModeHourRange,
    getStopOccupancyForDisplayMode,
} from "#utility/lineViewerUtils";
import { replaceArgs } from "@klyte45/vuio-commons";
import { useValue } from "cs2/api";
import { time } from "cs2/bindings";
import { LocalizedNumber, useLocalization } from "cs2/l10n";
import { Tooltip } from "cs2/ui";

type Props = {
    /** Departure stop whose historical occupancy is shown. */
    stop: StationData;
    /** Arrival stop for the segment (Between X to Y). */
    nextStop: StationData;
    mode: Exclude<SegmentOccupancyDisplayMode, "none">;
    /** Optional direction marker for symmetric half-trip view. */
    directionArrow?: "up" | "down";
    onSelectSegment?: (fromStop: StationData, toStop: StationData) => void;
};

function formatHourLabel(hour: number): string {
    const h = hour === 24 ? 0 : hour;
    return h.toFixed(0).padStart(2, "0") + ":00";
}

/**
 * Historical occupancy label for the selected display mode.
 * Positioning is owned by the parent segment-info row; this only renders the label.
 */
export function MapStationOccupancyContainerCmp({ stop, nextStop, mode, directionArrow, onSelectSegment }: Props) {
    const locale = useLocalization();
    const ticks = useValue(time.ticks$);
    const timeSettings = useValue(time.timeSettings$);
    const minutes = time.calculateMinutesSinceMidnightFromTicks(timeSettings, ticks);
    const hour = Math.floor(minutes / 60) % 24;
    const usage = getStopOccupancyForDisplayMode(stop, mode, hour);
    const occupancyCrowd = getCrowdnessBorderStyle(usage);
    const text = LocalizedNumber.renderString(locale, {
        value: usage * 100,
        unit: Unit.PercentageSingleFraction,
        signed: false,
    });
    const prefix = directionArrow === "up" ? "↑ " : directionArrow === "down" ? "↓ " : "";
    const label = prefix + text;

    let tooltipText: string;
    if (mode === "dayAverage") {
        tooltipText = translate(
            "lineViewer.occupancyDayAverageTooltip",
            "Average vehicle occupancy through the day.",
        );
    } else {
        const range = mode === "currentHour"
            ? getHistoricalUsageHourRange(hour)
            : (getSegmentOccupancyModeHourRange(mode) ?? getHistoricalUsageHourRange(hour));
        tooltipText = replaceArgs(
            translate(
                "lineViewer.occupancyTooltip",
                "Average vehicle occupancy between {startHour} and {endHour}.",
            ),
            {
                startHour: formatHourLabel(range.startHour),
                endHour: formatHourLabel(range.endHour),
            },
        );
    }

    return (
        <Tooltip tooltip={tooltipText} hideOnInteraction={false}>
            <div
                className={["occupancyLbl", occupancyCrowd.pulse && "crowdnessPulse"].filter(Boolean).join(" ")}
                style={{ backgroundColor: occupancyCrowd.borderColor }}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelectSegment?.(stop, nextStop);
                }}
            >
                {label}
            </div>
        </Tooltip>
    );
}
