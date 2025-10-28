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
            <div className="num">
                {this.props.contentOverride ?? (this.props.text)}
            </div>
            <div className="cargoMarker">©</div>
        </div>;
    }
}

