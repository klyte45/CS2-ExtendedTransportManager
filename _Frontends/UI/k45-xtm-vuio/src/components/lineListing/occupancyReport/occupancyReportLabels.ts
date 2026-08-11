import translate from "#utility/translate";

export type OccupancyReportSectionKind = "lines" | "segments";

const BUCKET_HEADER_KEYS: Record<number, [string, string]> = {
    0: ["lineViewer.segmentOccupancyMode.00_04", "00:00-04:00"],
    1: ["lineViewer.segmentOccupancyMode.04_08", "04:00-08:00"],
    2: ["lineViewer.segmentOccupancyMode.08_12", "08:00-12:00"],
    3: ["lineViewer.segmentOccupancyMode.12_16", "12:00-16:00"],
    4: ["lineViewer.segmentOccupancyMode.16_20", "16:00-20:00"],
    5: ["lineViewer.segmentOccupancyMode.20_24", "20:00-24:00"],
};

export function occupancyReportColumnLabel(columnId: "overall" | number): string {
    if (columnId === "overall") {
        return translate("occupancyReport.columnOverall", "Overall");
    }
    const key = BUCKET_HEADER_KEYS[columnId];
    return key ? translate(...key) : String(columnId);
}

export function occupancyReportKindTitle(kind: OccupancyReportSectionKind): string {
    return kind === "lines"
        ? translate("occupancyReport.topLinesTitle", "Top lines by 30th-percentile occupancy")
        : translate("occupancyReport.topSegmentsTitle", "Top segments by occupancy");
}
