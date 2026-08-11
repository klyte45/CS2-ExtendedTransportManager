import translate from "#utility/translate";
import { VanillaComponentResolver } from "@klyte45/vuio-commons";
import { FocusDisabled } from "cs2/input";
import { Scrollable } from "cs2/ui";
import {
    OccupancyReportColumnData,
    OccupancyReportColumnId,
    RankedLineItem,
    RankedSegmentItem,
} from "./occupancyReportRanking";
import { OccupancyReportLineItem } from "./OccupancyReportLineItem";
import { OccupancyReportSegmentItem } from "./OccupancyReportSegmentItem";

const BUCKET_HEADER_KEYS: Record<number, [string, string]> = {
    0: ["lineViewer.segmentOccupancyMode.00_04", "00:00-04:00"],
    1: ["lineViewer.segmentOccupancyMode.04_08", "04:00-08:00"],
    2: ["lineViewer.segmentOccupancyMode.08_12", "08:00-12:00"],
    3: ["lineViewer.segmentOccupancyMode.12_16", "12:00-16:00"],
    4: ["lineViewer.segmentOccupancyMode.16_20", "16:00-20:00"],
    5: ["lineViewer.segmentOccupancyMode.20_24", "20:00-24:00"],
};

const SORT_ICON_ASC = "coui://uil/Standard/ArrowSortHighDown.svg";
const SORT_ICON_DESC = "coui://uil/Standard/ArrowSortLowDown.svg";

function columnHeader(columnId: OccupancyReportColumnId): string {
    if (columnId === "overall") {
        return translate("occupancyReport.columnOverall", "Overall");
    }
    return translate(...BUCKET_HEADER_KEYS[columnId]);
}

type SectionKind = "lines" | "segments";

type Props = {
    title: string;
    kind: SectionKind;
    columns: OccupancyReportColumnData[];
    descending: boolean;
    onToggleDescending: () => void;
};

export function OccupancyReportSection({
    title,
    kind,
    columns,
    descending,
    onToggleDescending,
}: Props) {
    const ToolButton = VanillaComponentResolver.instance.ToolButton;
    const sectionClass =
        kind === "segments"
            ? "xtm-occupancyReportSection xtm-occupancyReportSection--segments"
            : "xtm-occupancyReportSection xtm-occupancyReportSection--lines";

    return (
        <section className={sectionClass}>
            <div className="xtm-occupancyReportSection_header">
                <div className="xtm-occupancyReportSection_title">{title}</div>
                <FocusDisabled>
                    <ToolButton
                        src={descending ? SORT_ICON_ASC : SORT_ICON_DESC}
                        selected={false}
                        tooltip={translate(
                            descending
                                ? "occupancyReport.sortDescending"
                                : "occupancyReport.sortAscending",
                            descending ? "Most usage first" : "Least usage first",
                        )}
                        onSelect={onToggleDescending}
                        focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                    />
                </FocusDisabled>
            </div>
            <div className="xtm-occupancyReportSection_grid">
                {columns.map((col) => (
                    <div key={String(col.columnId)} className="xtm-occupancyReportSection_column">
                        <div className="xtm-occupancyReportSection_columnHeader">
                            {columnHeader(col.columnId)}
                        </div>
                        {kind === "lines" ? (
                            <div className="xtm-occupancyReportSection_columnBody">
                                {renderLineColumn(col.lines)}
                            </div>
                        ) : (
                            <div className="xtm-occupancyReportSection_columnBody xtm-occupancyReportSection_columnBody--scroll">
                                <Scrollable className="xtm-occupancyReportSection_columnScroll">
                                    {renderSegmentColumn(col.segments)}
                                </Scrollable>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

function renderLineColumn(items: RankedLineItem[]) {
    if (!items.length) {
        return (
            <div className="xtm-occupancyReportSection_empty">
                {translate("occupancyReport.noData", "No data")}
            </div>
        );
    }
    return items.map((item, i) => (
        <OccupancyReportLineItem key={`${item.line.entity.Index}_${i}`} item={item} rank={i + 1} />
    ));
}

function renderSegmentColumn(items: RankedSegmentItem[]) {
    if (!items.length) {
        return (
            <div className="xtm-occupancyReportSection_empty">
                {translate("occupancyReport.noData", "No data")}
            </div>
        );
    }
    return items.map((item, i) => (
        <OccupancyReportSegmentItem
            key={`${item.line.entity.Index}_${item.sourceWaypointIndex}_${item.targetWaypointIndex}_${i}`}
            item={item}
            rank={i + 1}
        />
    ));
}
