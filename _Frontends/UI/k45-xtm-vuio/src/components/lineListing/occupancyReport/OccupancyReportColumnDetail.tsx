import translate from "#utility/translate";
import { replaceArgs, VanillaComponentResolver } from "@klyte45/vuio-commons";
import { FocusDisabled } from "cs2/input";
import { Scrollable } from "cs2/ui";
import { useEffect, useRef } from "react";
import {
    FULL_RANKING_LIMIT,
    OccupancyReportColumnId,
    RankedLineItem,
    RankedSegmentItem,
} from "./occupancyReportRanking";
import {
    OccupancyReportSectionKind,
    occupancyReportColumnLabel,
    occupancyReportKindTitle,
} from "./occupancyReportLabels";
import { OccupancyReportLineItem } from "./OccupancyReportLineItem";
import { OccupancyReportSegmentItem } from "./OccupancyReportSegmentItem";

const SORT_ICON_ASC = "coui://uil/Standard/ArrowSortHighDown.svg";
const SORT_ICON_DESC = "coui://uil/Standard/ArrowSortLowDown.svg";
const BACK_ICON = "coui://uil/Standard/ArrowLeft.svg";

type Props = {
    kind: OccupancyReportSectionKind;
    columnId: OccupancyReportColumnId;
    descending: boolean;
    onToggleDescending: () => void;
    onBack: () => void;
    lines: RankedLineItem[];
    segments: RankedSegmentItem[];
    /** True when ranking was truncated to FULL_RANKING_LIMIT. */
    limited?: boolean;
};

export function OccupancyReportColumnDetail({
    kind,
    columnId,
    descending,
    onToggleDescending,
    onBack,
    lines,
    segments,
    limited = false,
}: Props) {
    const ToolButton = VanillaComponentResolver.instance.ToolButton;
    const title = `${occupancyReportKindTitle(kind)} - ${occupancyReportColumnLabel(columnId)}`;
    const itemsEmpty = kind === "lines" ? lines.length === 0 : segments.length === 0;
    /** Scrollable forwards ref to content_gqa (the scrolling viewport). */
    const viewportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const onWheel = (e: WheelEvent) => {
            const dx = e.deltaX !== 0 ? e.deltaX : e.deltaY;
            if (dx === 0) return;
            e.preventDefault();
            e.stopImmediatePropagation();
            viewport.scrollLeft += dx;
        };

        viewport.addEventListener("wheel", onWheel, { capture: true, passive: false });
        return () => viewport.removeEventListener("wheel", onWheel, true);
    }, [kind, lines, segments]);

    return (
        <div className="xtm-occupancyReportDetail">
            <div className="xtm-occupancyReportSection_header">
                <FocusDisabled>
                    <ToolButton
                        src={BACK_ICON}
                        selected={false}
                        tooltip={translate("occupancyReport.backToOverview", "Back to overview")}
                        onSelect={onBack}
                        focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                    />
                </FocusDisabled>
                <div className="xtm-occupancyReportSection_title">{title}</div>
                {limited && (
                    <div className="xtm-occupancyReportDetail_limited">
                        {replaceArgs(translate("occupancyReport.topLimited", "Top {count}"), {
                            count: String(FULL_RANKING_LIMIT),
                        })}
                    </div>
                )}
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
            <div className="xtm-occupancyReportDetail_body">
                {itemsEmpty ? (
                    <div className="xtm-occupancyReportSection_empty">
                        {translate("occupancyReport.noData", "No data")}
                    </div>
                ) : (
                    <Scrollable
                        ref={viewportRef}
                        className="xtm-occupancyReportDetail_scroll"
                        horizontal
                        vertical={false}
                    >
                        <div className="xtm-occupancyReportDetail_flow">
                            {kind === "lines"
                                ? lines.map((item, i) => (
                                    <div key={`${item.line.entity.Index}_${i}`} className="xtm-occupancyReportDetail_cell">
                                        <OccupancyReportLineItem item={item} rank={i + 1} />
                                    </div>
                                ))
                                : segments.map((item, i) => (
                                    <div
                                        key={`${item.line.entity.Index}_${item.sourceWaypointIndex}_${item.targetWaypointIndex}_${i}`}
                                        className="xtm-occupancyReportDetail_cell"
                                    >
                                        <OccupancyReportSegmentItem item={item} rank={i + 1} />
                                    </div>
                                ))}
                        </div>
                    </Scrollable>
                )}
            </div>
        </div>
    );
}
