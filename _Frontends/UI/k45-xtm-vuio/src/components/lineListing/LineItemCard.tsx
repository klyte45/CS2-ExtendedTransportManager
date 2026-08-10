import { TlmLineFormatCmp } from "#components/lineViewer/TlmLineFormatCmp";
import { TransportType } from "#enum/TransportType";
import { Unit } from "#enum/Unit";
import { LineData } from "#service/LineManagementService";
import { ColorUtils, nameToString } from "@klyte45/vuio-commons";
import engine from "cohtml/cohtml";
import { LocalizedNumber, useLocalization } from "cs2/l10n";
import { CSSProperties } from "react";
import { TYPE_TO_ICONS } from "./lineListingTypes";

type LineItemCardProps = {
    lineData: LineData;
    onClick(): void;
};

function getNameFor(type: string, isCargo: boolean) {
    return engine.translate(isCargo ? `Transport.ROUTES[${type}]` : `Transport.LINES[${type}]`);
}

export const LineItemCard = ({ lineData: x, onClick }: LineItemCardProps) => {
    const localization = useLocalization();
    const typeIndex = `${x.type}.${x.isCargo}`;
    const fontColor = ColorUtils.toRGBA(ColorUtils.getContrastColorFor(ColorUtils.toColor01(x.color)));
    const effectiveIdentifier = x.xtmData?.Acronym || x.routeNumber.toFixed();
    const iconUrl = TYPE_TO_ICONS[typeIndex] ?? TYPE_TO_ICONS[`${TransportType.Bus}.false`];

    return (
        <div className="BgItem" onClick={onClick}>
            <div
                className="lineAcronym"
                style={{
                    "--xtm-line-color": ColorUtils.getClampedColor(x.color),
                    "--xtm-font-color": fontColor,
                    "--xtm-game-icon": `url(${iconUrl})`,
                } as CSSProperties}
            >
                <div className="text">{effectiveIdentifier}</div>
                <TlmLineFormatCmp className="icon" {...x} borderWidth="2px" contentOverride={<div className="gameIcon" />} />
            </div>
            <div className="lineName">{nameToString(x.name)}</div>
            <div className="lineType">{getNameFor(x.type, x.isCargo)}</div>
            <div className="lineLength">
                {LocalizedNumber.renderString(localization, { value: x.length, unit: Unit.Length })}
            </div>
            <div className="lineVehicles">
                {`${x.vehicles} ${engine.translate(`Transport.LEGEND_VEHICLES[${x.type}]`)}`}
            </div>
        </div>
    );
};
