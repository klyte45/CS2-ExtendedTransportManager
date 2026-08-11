import translate from "#utility/translate";
import { SegmentOccupancyReport } from "#service/SegmentOccupancyService";
import { LineActivityClass } from "#components/lineListing/lineListingTypes";
import { useMemo } from "react";
import { buildOccupancyReportColumns } from "./occupancyReportRanking";
import { OccupancyReportSection } from "./OccupancyReportSection";

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
    const columns = useMemo(() => {
        if (!report) return [];
        return buildOccupancyReportColumns(report, filterExclude, activityExclude);
    }, [report, filterExclude, activityExclude]);

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
                columns={columns}
            />
            <OccupancyReportSection
                title={translate(
                    "occupancyReport.topSegmentsTitle",
                    "Top segments by occupancy",
                )}
                kind="segments"
                columns={columns}
            />
        </div>
    );
}
