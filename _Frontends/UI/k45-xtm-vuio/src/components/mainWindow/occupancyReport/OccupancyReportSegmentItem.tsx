import { Unit } from "#enum/Unit";
import { TransportType } from "#enum/TransportType";
import { TlmLineFormatCmp } from "#components/lineViewer/TlmLineFormatCmp";
import { getCrowdnessBorderStyle } from "#utility/lineViewerUtils";
import translate from "#utility/translate";
import { nameToString, toVanillaEntity, VanillaComponentResolver } from "@klyte45/vuio-commons";
import { camera, selectedInfo } from "cs2/bindings";
import { LocalizedNumber, useLocalization } from "cs2/l10n";
import { RankedSegmentItem } from "./occupancyReportRanking";
import { getLineActivityClass } from "#components/mainWindow/mainWindowTypes";

const BUCKET_LABEL_KEYS: Record<number, [string, string]> = {
    0: ["lineViewer.segmentOccupancyMode.00_04", "00:00-04:00"],
    1: ["lineViewer.segmentOccupancyMode.04_08", "04:00-08:00"],
    2: ["lineViewer.segmentOccupancyMode.08_12", "08:00-12:00"],
    3: ["lineViewer.segmentOccupancyMode.12_16", "12:00-16:00"],
    4: ["lineViewer.segmentOccupancyMode.16_20", "16:00-20:00"],
    5: ["lineViewer.segmentOccupancyMode.20_24", "20:00-24:00"],
};

type Props = {
    item: RankedSegmentItem;
    rank: number;
};

export function OccupancyReportSegmentItem({ item, rank }: Props) {
    const localization = useLocalization();
    const Tooltip = VanillaComponentResolver.instance.Tooltip;
    const { line, score, sourceStop, targetStop, peakBucket } = item;
    const crowd = getCrowdnessBorderStyle(score);
    const shieldText = line.xtmData?.Acronym || line.routeNumber.toFixed();
    const lineName = nameToString(line.name) ?? "";
    const sourceName = sourceStop?.name ? (nameToString(sourceStop.name) ?? "—") : "—";
    const targetName = targetStop?.name ? (nameToString(targetStop.name) ?? "—") : "—";

    const occupancyPct = LocalizedNumber.renderString(localization, {
        value: score * 100,
        unit: Unit.PercentageSingleFraction,
        signed: false,
    });
    const periodLabel =
        peakBucket != null && BUCKET_LABEL_KEYS[peakBucket]
            ? translate(...BUCKET_LABEL_KEYS[peakBucket])
            : null;
    const occupancyText = periodLabel ? `${periodLabel} • ${occupancyPct}` : occupancyPct;

    /** Same as line-map station bullet: select + focus the connected stop entity. */
    const openSourceStop = () => {
        if (!sourceStop?.entity) return;
        const entity = toVanillaEntity(sourceStop.entity);
        selectedInfo.selectEntity(entity);
        camera.focusEntity(entity);
    };

    return (
        <div className="xtm-occupancyReportItem">
            <div className="xtm-occupancyReportItem_shield">
                <div className="xtm-occupancyReportItem_rank">{`#${rank}`}</div>
                <Tooltip tooltip={lineName}>
                    <div>
                        <TlmLineFormatCmp
                            color={line.color}
                            type={line.type as TransportType}
                            isCargo={line.isCargo}
                            text={shieldText}
                            className="xtm-occupancyReportItem_format"
                            activity={getLineActivityClass(line)}
                            onClick={openSourceStop}
                        />
                    </div>
                </Tooltip>
            </div>
            <div className="xtm-occupancyReportItem_body">
                <div className="xtm-occupancyReportItem_stops">
                    <div className="xtm-occupancyReportItem_stop">{sourceName}</div>
                    <div className="xtm-occupancyReportItem_arrow">↓</div>
                    <div className="xtm-occupancyReportItem_stop">{targetName}</div>
                </div>
                <div
                    className={["xtm-occupancyReportItem_occupancy", crowd.pulse && "crowdnessPulse"].filter(Boolean).join(" ")}
                    style={{ backgroundColor: crowd.borderColor }}
                >
                    {occupancyText}
                </div>
            </div>
        </div>
    );
}
