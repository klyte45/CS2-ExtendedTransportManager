import { Unit } from "#enum/Unit";
import { TransportType } from "#enum/TransportType";
import { TlmLineFormatCmp } from "#components/lineViewer/TlmLineFormatCmp";
import { getCrowdnessBorderStyle } from "#utility/lineViewerUtils";
import { nameToString, toVanillaEntity } from "@klyte45/vuio-commons";
import { transport } from "cs2/bindings";
import { LocalizedNumber, useLocalization } from "cs2/l10n";
import { RankedLineItem } from "./occupancyReportRanking";
import { getLineActivityClass } from "#components/lineListing/lineListingTypes";

type Props = {
    item: RankedLineItem;
    rank: number;
};

export function OccupancyReportLineItem({ item, rank }: Props) {
    const localization = useLocalization();
    const { line, score } = item;
    const crowd = getCrowdnessBorderStyle(score);
    const shieldText = line.xtmData?.Acronym || line.routeNumber.toFixed();

    return (
        <div className="xtm-occupancyReportItem">
            <div className="xtm-occupancyReportItem_shield">
                <div className="xtm-occupancyReportItem_rank">{`#${rank}`}</div>
                <TlmLineFormatCmp
                    color={line.color}
                    type={line.type as TransportType}
                    isCargo={line.isCargo}
                    text={shieldText}
                    className="xtm-occupancyReportItem_format"
                    activity={getLineActivityClass(line)}
                    onClick={() => transport.selectLine(toVanillaEntity(line.entity))}
                />
            </div>
            <div className="xtm-occupancyReportItem_body">
                <div className="xtm-occupancyReportItem_name">{nameToString(line.name) ?? ""}</div>
                <div
                    className={["xtm-occupancyReportItem_occupancy", crowd.pulse && "crowdnessPulse"].filter(Boolean).join(" ")}
                    style={{ backgroundColor: crowd.borderColor }}
                >
                    {LocalizedNumber.renderString(localization, {
                        value: score * 100,
                        unit: Unit.PercentageSingleFraction,
                        signed: false,
                    })}
                </div>
            </div>
        </div>
    );
}
