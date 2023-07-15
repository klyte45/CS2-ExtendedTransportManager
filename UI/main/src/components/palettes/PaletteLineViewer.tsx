import { PaletteData } from "#service/PaletteService";
import { ColorUtils } from "#utility/ColorUtils";
import { CSSProperties, Component } from "react";
import { ExtendedPaletteData } from "#components/palettes/PaletteCategoryCmp";

export class PaletteLineViewer extends Component<{
    entry: ExtendedPaletteData;
    actionButtons?: (palette: PaletteData) => JSX.Element;
}> {
    render() {
        return <div className="paletteViewer">
            <label className="w10" style={{ flexDirection: "column", justifySelf: "center", alignSelf: "center", display: "flex" }}>{this.props.entry._CurrName ?? this.props.entry.Name}</label>
            <div className="colorShowcaseContainer w70">
                <div className="colorShowcase">
                    {this.props.entry.ColorsRGB.map((clr, j) =>
                        <div className="lineIconContainer" key={j}>
                            <div className="lineIcon" style={{ "--lineColor": clr, "--contrastColor": ColorUtils.toRGBA(ColorUtils.getContrastColorFor(ColorUtils.toColor01(clr))) } as CSSProperties}>
                                <div className={`routeNum chars${(j + 1)?.toString().length}`}>{j + 1}</div>
                            </div>
                        </div>)}
                </div>
            </div>
            {this.props.actionButtons &&
                <div className="w20" style={{ flexDirection: "row-reverse", justifySelf: "center", alignSelf: "center", display: "flex" }}>
                    {this.props.actionButtons(this.props.entry)}
                </div>}
        </div>;
    }
}
