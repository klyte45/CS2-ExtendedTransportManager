import "#styles/TLM_FormatContainer.scss";
import { ColorUtils } from "#utility/ColorUtils";
import { CSSProperties, Component, ReactNode } from "react";
import { LineData } from "../LineListCmp";


export class TlmLineFormatCmp extends Component<{
    lineCommonData: LineData;
}, {}> {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render(): ReactNode {
        const lineCommonData = this.props.lineCommonData;
        return <div className="formatContainer">
            <div style={{ "--currentBgColor": ColorUtils.getClampedColor(lineCommonData.color) } as CSSProperties} className={`format ${lineCommonData.type} ${lineCommonData.isCargo ? "cargo" : "passengers"}`}>
                <div className="before"></div>
                <div className="after"></div>
            </div>
            <div style={{
                fontSize: getFontSizeForText(lineCommonData.xtmData?.Acronym || lineCommonData.routeNumber.toFixed()),
                color: ColorUtils.toRGBA(ColorUtils.getContrastColorFor(ColorUtils.toColor01(lineCommonData.color)))
            }} className="num">
                {lineCommonData.xtmData?.Acronym || (lineCommonData.routeNumber.toFixed())}
            </div>
        </div>;
    }
}


export function getFontSizeForText(text: string) {
    switch (Math.max(...(text || "").split(" ").map(x => x.length))) {
        case 1:
            return "52px";
        case 2:
            return "44px";
        case 3:
            return "32px";
        case 4:
            return "22px";
        case 5:
            return "18px";
        case 6:
            return "15px";
        default:
            return "11px";
    }
}
