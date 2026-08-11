import translate from "#utility/translate";
import { SegmentOccupancyReport } from "#service/SegmentOccupancyService";
import { LineActivityClass } from "#components/lineListing/lineListingTypes";
import { useMemo, useState } from "react";
import {
    FULL_RANKING_LIMIT,
    OccupancyReportColumnId,
    buildOccupancyReportColumns,
} from "./occupancyReportRanking";
import { OccupancyReportSectionKind } from "./occupancyReportLabels";
import { OccupancyReportSection } from "./OccupancyReportSection";
import { OccupancyReportColumnDetail } from "./OccupancyReportColumnDetail";

/** Survives report page remounts within the session. */
let persistedLinesDescending = true;
let persistedSegmentsDescending = true;

type Drilldown = {
    kind: OccupancyReportSectionKind;
    columnId: OccupancyReportColumnId;
};

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
    const [drilldown, setDrilldown] = useState<Drilldown | null>(null);
    const [detailDescending, setDetailDescending] = useState(true);

    const lineColumns = useMemo(() => {
        if (!report) return [];
        return buildOccupancyReportColumns(report, filterExclude, activityExclude, linesDescending);
    }, [report, filterExclude, activityExclude, linesDescending]);

    const segmentColumns = useMemo(() => {
        if (!report) return [];
        return buildOccupancyReportColumns(report, filterExclude, activityExclude, segmentsDescending);
    }, [report, filterExclude, activityExclude, segmentsDescending]);

    const detailColumn = useMemo(() => {
        if (!report || !drilldown) return null;
        const cols = buildOccupancyReportColumns(
            report,
            filterExclude,
            activityExclude,
            detailDescending,
            FULL_RANKING_LIMIT,
            FULL_RANKING_LIMIT,
        );
        return cols.find((c) => c.columnId === drilldown.columnId) ?? null;
    }, [report, filterExclude, activityExclude, drilldown, detailDescending]);

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

    if (drilldown && detailColumn) {
        return (
            <div className="xtm-occupancyReportPage">
                <OccupancyReportColumnDetail
                    kind={drilldown.kind}
                    columnId={drilldown.columnId}
                    descending={detailDescending}
                    onToggleDescending={() => setDetailDescending((v) => !v)}
                    onBack={() => setDrilldown(null)}
                    lines={detailColumn.lines}
                    segments={detailColumn.segments}
                    limited={
                        drilldown.kind === "lines"
                            ? detailColumn.linesTotal > detailColumn.lines.length
                            : detailColumn.segmentsTotal > detailColumn.segments.length
                    }
                />
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
                onOpenColumn={(columnId) => {
                    setDetailDescending(linesDescending);
                    setDrilldown({ kind: "lines", columnId });
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
                onOpenColumn={(columnId) => {
                    setDetailDescending(segmentsDescending);
                    setDrilldown({ kind: "segments", columnId });
                }}
            />
        </div>
    );
}
