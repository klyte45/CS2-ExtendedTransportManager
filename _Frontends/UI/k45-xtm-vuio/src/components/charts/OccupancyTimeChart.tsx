import { Unit } from "#enum/Unit";
import { ColorUtils, VanillaComponentResolver, VanillaFnResolver } from "@klyte45/vuio-commons";
import classNames from "classnames";
import { useMemo } from "react";
import "#styles/OccupancyTimeChart.scss";

type Props = {
    /** Series of 0–1 ratios (or null for stale gaps); six 4h buckets. */
    data: (number | null)[];
    /** Line color (hex); used for stroke and fill. */
    color: string;
    className?: string;
};

function formatHourRangeLabel(startHour: number, endHour: number): string {
    const end = endHour === 24 ? 0 : endHour;
    return `${startHour}h~${end}h`;
}

const HOUR_RANGE_LABELS = [
    formatHourRangeLabel(0, 4),
    formatHourRangeLabel(4, 8),
    formatHourRangeLabel(8, 12),
    formatHourRangeLabel(12, 16),
    formatHourRangeLabel(16, 20),
    formatHourRangeLabel(20, 24),
];

/**
 * 4h occupancy line chart (TrafficFlowChart-style) using remapped ResponsiveChart.
 */
export function OccupancyTimeChart({ data, color, className }: Props) {
    const ResponsiveChart = VanillaComponentResolver.instance.ResponsiveChart;
    const theme = VanillaComponentResolver.instance.trafficChartTheme;
    const formatPercent = VanillaFnResolver.instance.localizedNumber.useNumberFormat(Unit.Percentage as any, false);

    const { borderColor, backgroundColor } = useMemo(() => {
        const c = ColorUtils.toColor01(color);
        return {
            borderColor: ColorUtils.toRGBA({ ...c, a: 1 }),
            backgroundColor: ColorUtils.toRGBA({ ...c, a: 0.5 }),
        };
    }, [color]);

    const chartData = useMemo(() => ({
        labels: HOUR_RANGE_LABELS,
        datasets: [{
            label: "occupancy",
            data: data.map((v) => (v == null ? null : v * 100)),
            spanGaps: false,
        }],
    }), [data]);

    const options = useMemo(() => ({
        elements: {
            line: {
                borderColor,
                backgroundColor,
                borderWidth: 2,
                fill: true,
            },
            point: {
                borderColor,
                backgroundColor: borderColor,
                radius: 2,
                hoverRadius: 2,
                borderWidth: 2,
                hoverBorderWidth: 2,
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: { lineWidth: 2, color: theme.chartLineColor },
                ticks: {
                    font: { size: 9, weight: "bold" },
                    color: theme.chartFontColor,
                    padding: 8,
                    autoSkip: false,
                    maxRotation: 0,
                    minRotation: 0,
                },
            },
            y: {
                min: 0,
                suggestedMax: 100,
                grid: { lineWidth: 2, color: theme.chartLineColor },
                ticks: {
                    font: { size: 10, weight: "bold" },
                    color: theme.chartFontColor,
                    padding: 10,
                    autoSkip: false,
                    maxTicksLimit: 6,
                    callback: (value: number | string) => formatPercent(Number(value)),
                },
            },
        },
    }), [theme, formatPercent, borderColor, backgroundColor]);

    return (
        <div className={classNames("k45_xtm_occupancyTimeChart", className)}>
            <ResponsiveChart
                type="line"
                data={chartData}
                options={options}
                className={theme.trafficChart}
            />
        </div>
    );
}
