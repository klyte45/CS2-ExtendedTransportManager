import {
    LineShieldInfo,
    SegmentOccupancyEntry,
    SegmentOccupancyReport,
    SegmentOccupancyStop,
} from "#service/SegmentOccupancyService";
import { LineActivityClass, getLineActivityClass } from "#components/lineListing/lineListingTypes";

export const OCCUPANCY_BUCKET_COUNT = 6;
export const TOP_LINES_PER_COLUMN = 3;
export const TOP_SEGMENTS_PER_COLUMN = 10;

/** Column indices: 0 = overall, 1..6 = buckets 0..5 */
export type OccupancyReportColumnId = "overall" | 0 | 1 | 2 | 3 | 4 | 5;

export const OCCUPANCY_REPORT_COLUMNS: OccupancyReportColumnId[] = [
    "overall", 0, 1, 2, 3, 4, 5,
];

export type RankedLineItem = {
    line: LineShieldInfo;
    score: number;
};

export type RankedSegmentItem = {
    line: LineShieldInfo;
    sourceStop: SegmentOccupancyStop | undefined;
    targetStop: SegmentOccupancyStop | undefined;
    sourceWaypointIndex: number;
    targetWaypointIndex: number;
    score: number;
    /** Winning 4h bucket (0–5) for Overall column items; omitted on time-specific columns. */
    peakBucket?: number;
};

export type OccupancyReportColumnData = {
    columnId: OccupancyReportColumnId;
    lines: RankedLineItem[];
    segments: RankedSegmentItem[];
};

function entityKey(entity: { Index: number; Version?: number } | null | undefined): string {
    if (!entity) return "";
    return `${entity.Index}_${entity.Version ?? 0}`;
}

function segmentRatio(entry: SegmentOccupancyEntry): number | null {
    if (!(entry.capacityRegistered > 0)) return null;
    return Math.min(1, entry.occupancyNumber / entry.capacityRegistered);
}

/** Nearest-rank 30th percentile of ascending values. */
export function percentile30(values: number[]): number | null {
    if (!values.length) return null;
    const sorted = values.slice().sort((a, b) => a - b);
    const idx = Math.max(0, Math.ceil(sorted.length * 0.3) - 1);
    return sorted[idx];
}

function scheduleActivityClass(schedule: number): LineActivityClass {
    return getLineActivityClass({ active: true, schedule });
}

export function filterReportLines(
    lines: LineShieldInfo[],
    filterExclude: string[],
    activityExclude: LineActivityClass[],
): LineShieldInfo[] {
    return lines.filter((line) => {
        if (filterExclude.includes(`${line.type}.${line.isCargo}`)) return false;
        if (activityExclude.includes(scheduleActivityClass(line.schedule))) return false;
        return true;
    });
}

type EdgeKey = string;

function edgeKey(lineIndex: number, sourceWp: string, targetWp: string): EdgeKey {
    return `${lineIndex}|${sourceWp}|${targetWp}`;
}

/**
 * Build top-N lines and segments for each of 7 columns from a city report.
 * @param descending true = highest usage first (default); false = lowest usage first
 */
export function buildOccupancyReportColumns(
    report: SegmentOccupancyReport,
    filterExclude: string[],
    activityExclude: LineActivityClass[],
    descending: boolean = true,
): OccupancyReportColumnData[] {
    const lines = filterReportLines(report.lines ?? [], filterExclude, activityExclude);
    const lineByKey = new Map(lines.map((l) => [entityKey(l.entity), l]));
    const allowedLineKeys = new Set(lineByKey.keys());

    const stopsByWaypoint = new Map<string, SegmentOccupancyStop>();
    for (const stop of report.stops ?? []) {
        stopsByWaypoint.set(entityKey(stop.waypoint), stop);
    }

    // Per line → bucket → ratios; and all-bucket ratios for overall p30
    const lineBucketRatios = new Map<string, number[][]>();
    const lineAllRatios = new Map<string, number[]>();
    for (const line of lines) {
        const key = entityKey(line.entity);
        lineBucketRatios.set(key, Array.from({ length: OCCUPANCY_BUCKET_COUNT }, () => []));
        lineAllRatios.set(key, []);
    }

    // Per edge → bucket ratios
    type EdgeAccum = {
        lineKey: string;
        sourceWp: string;
        targetWp: string;
        buckets: (number | null)[];
    };
    const edges = new Map<EdgeKey, EdgeAccum>();

    for (const seg of report.segments ?? []) {
        const lineKey = entityKey(seg.lineEntity);
        if (!allowedLineKeys.has(lineKey)) continue;
        const ratio = segmentRatio(seg);
        if (ratio == null) continue;
        const bucket = seg.timeSpanBucket;
        if (bucket < 0 || bucket >= OCCUPANCY_BUCKET_COUNT) continue;

        lineBucketRatios.get(lineKey)![bucket].push(ratio);
        lineAllRatios.get(lineKey)!.push(ratio);

        const srcWp = entityKey(seg.sourceWaypointStopEntity);
        const tgtWp = entityKey(seg.targetWaypointStopEntity);
        const ek = edgeKey(seg.lineEntity.Index, srcWp, tgtWp);
        let edge = edges.get(ek);
        if (!edge) {
            edge = {
                lineKey,
                sourceWp: srcWp,
                targetWp: tgtWp,
                buckets: Array(OCCUPANCY_BUCKET_COUNT).fill(null),
            };
            edges.set(ek, edge);
        }
        edge.buckets[bucket] = ratio;
    }

    const lineScoresByColumn = new Map<OccupancyReportColumnId, RankedLineItem[]>();
    const segmentScoresByColumn = new Map<OccupancyReportColumnId, RankedSegmentItem[]>();

    const rankLines = (scoreOf: (lineKey: string) => number | null): RankedLineItem[] => {
        const ranked: RankedLineItem[] = [];
        for (const line of lines) {
            const key = entityKey(line.entity);
            const score = scoreOf(key);
            if (score == null) continue;
            ranked.push({ line, score });
        }
        ranked.sort((a, b) => {
            if (a.score !== b.score) return descending ? b.score - a.score : a.score - b.score;
            return a.line.routeNumber - b.line.routeNumber;
        });
        return ranked.slice(0, TOP_LINES_PER_COLUMN);
    };

    const toSegmentItem = (
        edge: EdgeAccum,
        score: number,
        peakBucket?: number,
    ): RankedSegmentItem | null => {
        const line = lineByKey.get(edge.lineKey);
        if (!line) return null;
        return {
            line,
            sourceStop: stopsByWaypoint.get(edge.sourceWp),
            targetStop: stopsByWaypoint.get(edge.targetWp),
            sourceWaypointIndex: Number(edge.sourceWp.split("_")[0]) || 0,
            targetWaypointIndex: Number(edge.targetWp.split("_")[0]) || 0,
            score,
            peakBucket,
        };
    };

    const rankSegments = (
        scoreOf: (edge: EdgeAccum) => { score: number; peakBucket?: number } | null,
    ): RankedSegmentItem[] => {
        const ranked: RankedSegmentItem[] = [];
        for (const edge of edges.values()) {
            const result = scoreOf(edge);
            if (result == null) continue;
            const item = toSegmentItem(edge, result.score, result.peakBucket);
            if (item) ranked.push(item);
        }
        ranked.sort((a, b) => {
            if (a.score !== b.score) return descending ? b.score - a.score : a.score - b.score;
            if (a.line.routeNumber !== b.line.routeNumber) return a.line.routeNumber - b.line.routeNumber;
            return a.sourceWaypointIndex - b.sourceWaypointIndex;
        });
        return ranked.slice(0, TOP_SEGMENTS_PER_COLUMN);
    };

    lineScoresByColumn.set("overall", rankLines((key) => percentile30(lineAllRatios.get(key) ?? [])));
    segmentScoresByColumn.set("overall", rankSegments((edge) => {
        let max: number | null = null;
        let peakBucket: number | undefined;
        for (let b = 0; b < edge.buckets.length; b++) {
            const r = edge.buckets[b];
            if (r == null) continue;
            if (max == null || r > max) {
                max = r;
                peakBucket = b;
            }
        }
        return max == null ? null : { score: max, peakBucket };
    }));

    for (let b = 0; b < OCCUPANCY_BUCKET_COUNT; b++) {
        const col = b as OccupancyReportColumnId;
        lineScoresByColumn.set(col, rankLines((key) => percentile30(lineBucketRatios.get(key)?.[b] ?? [])));
        segmentScoresByColumn.set(col, rankSegments((edge) => {
            const r = edge.buckets[b];
            return r == null ? null : { score: r };
        }));
    }

    return OCCUPANCY_REPORT_COLUMNS.map((columnId) => ({
        columnId,
        lines: lineScoresByColumn.get(columnId) ?? [],
        segments: segmentScoresByColumn.get(columnId) ?? [],
    }));
}
