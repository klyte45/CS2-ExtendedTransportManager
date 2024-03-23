import { LineData } from "#service/LineManagementService";
import "#styles/TLM_FormatContainer.scss";
import { ColorUtils } from "@klyte45/euis-components";
import { CSSProperties, Component, ReactNode } from "react";
import { TransportType } from "#enum/TransportType";

export class TlmLineFormatCmp extends Component<{
    color: string;
    strokeColor?: string;
    text?: string;
    type: TransportType;
    isCargo: boolean
    contentOverride?: JSX.Element | null;
    className?: string;
    borderWidth?: string
}, {}> {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render(): ReactNode {
        const fontColor = ColorUtils.toRGBA(ColorUtils.getContrastColorFor(ColorUtils.toColor01(this.props.color)));
        return <div className={this.props.className + " formatContainer"} style={{ "--fontColor": fontColor } as CSSProperties}>
            <div style={{ "--currentBgColor": ColorUtils.getClampedColor(this.props.color), "--form-border-width": this.props.borderWidth ?? "0" } as CSSProperties} className={`format ${this.props.type} ${this.props.isCargo ? "cargo" : "passengers"}`}>
                {this.props.borderWidth && <div className="before"></div>}
                <div className="after"></div>
            </div>
            <div style={{
                fontSize: getFontSizeForText(this.props.text)
            } as CSSProperties} className="num">
                {this.props.contentOverride ?? (this.props.text)}
            </div>
        </div>;
    }
}


export function getFontSizeForText(text: string) {
    const splitText = (text || "").split(" ");
    switch (Math.max(splitText.length, ...splitText.map(x => x.length))) {
        case 1:
            return "52rem";
        case 2:
            return "33rem";
        case 3:
            return "24rem";
        case 4:
            return "17rem";
        case 5:
            return "14rem";
        default:
            return "11rem";
    }
}
