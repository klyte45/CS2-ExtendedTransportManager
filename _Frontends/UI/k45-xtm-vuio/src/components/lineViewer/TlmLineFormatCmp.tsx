import "#styles/TLM_FormatContainer.scss";
import { CSSProperties } from "react";
import { TransportType } from "#enum/TransportType";
import { ColorUtils } from "@klyte45/vuio-commons";
import { selectedInfo } from "cs2/bindings";

type Props = {
    color: string;
    strokeColor?: string;
    text?: string;
    type: TransportType;
    isCargo: boolean;
    contentOverride?: JSX.Element | null;
    className?: string;
    borderWidth?: string;
    onClick?: () => void;
};

export function TlmLineFormatCmp({ color, text, type, isCargo, contentOverride, className, borderWidth, onClick }: Props) {
    const fontColor = ColorUtils.toRGBA(ColorUtils.getContrastColorFor(ColorUtils.toColor01(color)));
    return <div className={className + " formatContainer"} style={{ "--fontColor": fontColor } as CSSProperties} onClick={onClick}>
        <div style={{ "--currentBgColor": ColorUtils.getClampedColor(color), "--form-border-width": borderWidth ?? "0" } as CSSProperties} className={`format ${type} ${isCargo ? "cargo" : "passengers"}`}>
            {borderWidth && <div className="before"></div>}
            <div className="after"></div>
        </div>
        <div className="num">
            {contentOverride ?? text}
        </div>
        <div className="cargoMarker">©</div>
    </div>;
}

