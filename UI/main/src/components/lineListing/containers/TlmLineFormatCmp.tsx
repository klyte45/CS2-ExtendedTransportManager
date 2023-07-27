import { LineData } from "#service/LineManagementService";
import "#styles/TLM_FormatContainer.scss";
import { ColorUtils } from "#utility/ColorUtils";
import { CSSProperties, Component, ReactNode } from "react";

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
        const fontColor = ColorUtils.toRGBA(ColorUtils.getContrastColorFor(ColorUtils.toColor01(lineCommonData.color)));
        return <div className="formatContainer" style={{ "--fontColor": fontColor } as CSSProperties}>
            <div style={{ "--currentBgColor": ColorUtils.getClampedColor(lineCommonData.color) } as CSSProperties} className={`format ${lineCommonData.type} ${lineCommonData.isCargo ? "cargo" : "passengers"}`}>

                <div className="after"></div>
            </div>
            <div style={{
                fontSize: getFontSizeForText(lineCommonData.xtmData?.Acronym || lineCommonData.routeNumber.toFixed())
            } as CSSProperties} className="num">
                {lineCommonData.xtmData?.Acronym || (lineCommonData.routeNumber.toFixed())}
            </div>
        </div>;
    }
}


export function getFontSizeForText(text: string) {
    const splitText = (text || "").split(" ");
    switch (Math.max(splitText.length, ...splitText.map(x => x.length))) {
        case 1:
            return "52px";
        case 2:
            return "33px";
        case 3:
            return "24px";
        case 4:
            return "17px";
        case 5:
            return "14px";
        default:
            return "11px";
    }
}
