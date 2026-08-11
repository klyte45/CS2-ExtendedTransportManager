import translate from "#utility/translate";
import { SegmentOccupancyReport } from "#service/SegmentOccupancyService";
import { LineActivityClass } from "#components/lineListing/lineListingTypes";
import { useMemo, useState } from "react";
import { buildOccupancyReportColumns } from "./occupancyReportRanking";
import { OccupancyReportSection } from "./OccupancyReportSection";

/** Survives report page remounts within the session. */
let persistedLinesDescending = true;
let persistedSegmentsDescending = true;

type Props = {
    report: SegmentOccupancyReport | null;
    loading: boolean;
    filterExclude: string[];
    activityExclude: LineActivityClass[];
};

export function XtmOccupancyReportPage({
    report,
    loading,
    filterExclude,
    activityExclude,
}: Props) {
    const [linesDescending, setLinesDescending] = useState(persistedLinesDescending);
    const [segmentsDescending, setSegmentsDescending] = useState(persistedSegmentsDescending);

    const lineColumns = useMemo(() => {
        if (!report) return [];
        return buildOccupancyReportColumns(report, filterExclude, activityExclude, linesDescending);
    }, [report, filterExclude, activityExclude, linesDescending]);

    const segmentColumns = useMemo(() => {
        if (!report) return [];
        return buildOccupancyReportColumns(report, filterExclude, activityExclude, segmentsDescending);
    }, [report, filterExclude, activityExclude, segmentsDescending]);

    if (loading && !report) {
        return (
            <div className="xtm-occupancyReportPage xtm-occupancyReportPage_status">
                {translate("occupancyReport.loading", "Loading…")}
            </div>
        );
    }

    if (!report) {
        return (
            <div className="xtm-occupancyReportPage xtm-occupancyReportPage_status">
                {translate("occupancyReport.noData", "No data")}
            </div>
        );
    }

    return (
        <div className="xtm-occupancyReportPage">
            <OccupancyReportSection
                title={translate(
                    "occupancyReport.topLinesTitle",
                    "Top lines by 30th-percentile occupancy",
                )}
                kind="lines"
                columns={lineColumns}
                descending={linesDescending}
                onToggleDescending={() => {
                    const next = !linesDescending;
                    persistedLinesDescending = next;
                    setLinesDescending(next);
                }}
            />
            <OccupancyReportSection
                title={translate(
                    "occupancyReport.topSegmentsTitle",
                    "Top segments by occupancy",
                )}
                kind="segments"
                columns={segmentColumns}
                descending={segmentsDescending}
                onToggleDescending={() => {
                    const next = !segmentsDescending;
                    persistedSegmentsDescending = next;
                    setSegmentsDescending(next);
                }}
            />
        </div>
    );
}
