import { PaletteData, PaletteService } from "#service/PaletteService";
import { ColorUtils } from "#utility/ColorUtils";
import translate from "#utility/translate";
import { CSSProperties, Component } from "react";
import { ExtendedPaletteData, PaletteCategoryCmp, categorizePalettes } from "#components/palettes/PaletteCategoryCmp";
import '#styles/PaletteLineViewer.scss'
import { Checkbox } from "#components/common/checkbox";
import { Input } from "#components/common/input";

type State = {
    willRandomize: boolean,
    paletteData: PaletteData,
    paletteNameImport: string
}


type Props = {
    paletteData: PaletteData
    onBack: () => void,
    onOk: (x: State) => void
}



export default class PaletteImportingCmp extends Component<Props, State> {

    constructor(props: Props | Readonly<Props>) {
        super(props);
        this.state = {
            willRandomize: false,
            paletteData: props.paletteData,
            paletteNameImport: props.paletteData.Name
        }
    }

    render() {
        return <>
            <h1>{translate("palettesImport.title")}</h1>
            <h3>{translate("palettesImport.subtitle")}</h3>
            <section style={{ overflow: "scroll", position: "absolute", bottom: this.props.onBack ? 52 : 0, left: 5, right: 5, top: 107 }}>
                <div style={{ textAlign: "center", width: "100%", fontSize: "30rem" } as CSSProperties}>{this.props.paletteData.Name.split("/").pop()}</div>
                <div className="fullDivider" />
                <div className="colorShowcaseContainer" style={{ alignItems: "center", "--lineIconSizeMultiplier": 2 } as CSSProperties}>
                    <div className="colorShowcase">
                        {
                            this.props.paletteData.ColorsRGB.map((clr, j) =>
                                <div className="lineIcon" style={{ "--lineColor": clr, "--contrastColor": ColorUtils.toRGBA(ColorUtils.getContrastColorFor(ColorUtils.toColor01(clr))) } as CSSProperties} key={j}>
                                    <div className={`routeNum chars${(j + 1)?.toString().length}`}> {j + 1}</div>
                                </div>)
                        }
                    </div>
                </div>
                <div className="fullDivider" />
                <div>
                    <Input title={translate("palettesImport.cityImportName")} getValue={() => this.state.paletteNameImport} onValueChanged={(x) => { this.setState({ paletteNameImport: x }); return x; }} />
                </div>
                <div>
                    <Checkbox isChecked={() => this.state.willRandomize} onValueToggle={(x) => this.setState({ willRandomize: x })} title={translate("palettesImport.randomizeColorOrder")} />
                </div>
                <div>
                </div>
            </section>
            <div style={{ display: "flex", position: "absolute", left: 5, right: 5, bottom: 5 }}>
                <div className="w60"></div>
                <button className="positiveBtn w20" onClick={() => this.props.onOk(this.state)}>{translate("palettesImport.import")}</button>
                <button className="negativeBtn w20" onClick={this.props.onBack}>{translate("palettesImport.cancel")}</button>
            </div>
        </>;
    }
}

