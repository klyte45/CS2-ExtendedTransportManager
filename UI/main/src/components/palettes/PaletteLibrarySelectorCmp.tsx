import { PaletteData, PaletteService } from "#service/PaletteService";
import { ColorUtils } from "#utility/ColorUtils";
import translate from "#utility/translate";
import { CSSProperties, Component } from "react";
import { ExtendedPaletteData, PaletteCategoryCmp, categorizePalettes } from "#components/palettes/PaletteCategoryCmp";
import '#styles/PaletteLineViewer.scss'

type State = {
    availablePalettes: PaletteStructureTreeNode,
}

type PaletteStructureTreeNode = {
    rootContent: PaletteData[],
    subtrees: Record<string, PaletteStructureTreeNode>
}

type Props = {
    actionButtons?: (palette: PaletteData) => JSX.Element,
    onBack?: () => void
}



export default class PaletteLibrarySelectorCmp extends Component<Props, State> {

    constructor(props) {
        super(props);
        this.state = {
            availablePalettes: { subtrees: {}, rootContent: [] }
        }
    }
    componentDidMount() {
        const _this = this;
        engine.whenReady.then(async () => {
            this.updatePalettes();
        })
    }
    private async updatePalettes() {
        const palettesSaved = await PaletteService.listLibraryPalettes();
        const paletteTree = categorizePalettes(palettesSaved)
        const root = paletteTree[""]?.rootContent ?? []
        delete paletteTree[""];
        this.setState({
            availablePalettes: {
                rootContent: root,
                subtrees: paletteTree
            }
        });
    }

    render() {
        return <>
            <h1>{translate("palettesLibrary.title")}</h1>
            <h3>{translate("palettesLibrary.subtitle")}</h3>
            <section style={{ overflow: "scroll", position: "absolute", bottom: this.props.onBack ? 52 : 0, left: 5, right: 5, top: 107 }}>
                <PaletteCategoryCmp entry={this.state?.availablePalettes} doWithPaletteData={(x, i) => <PaletteLineViewer entry={x} key={i} actionButtons={this.props.actionButtons} />} />
            </section>
            {this.props.onBack && <div style={{ display: "flex", position: "absolute", left: 5, right: 5, bottom: 5 }}>
                <div className="w90"></div>
                <button className="negativeBtn w10" onClick={this.props.onBack}>Back</button>
            </div>}
        </>;
    }
}

class PaletteLineViewer extends Component<{
    entry: ExtendedPaletteData,
    actionButtons?: (palette: PaletteData) => JSX.Element
}> {
    render() {
        return <div className="paletteViewer">
            <label className="w10"  style={{ flexDirection: "column", justifySelf: "center", alignSelf: "center", display: "flex" }}>{this.props.entry._CurrName ?? this.props.entry.Name}</label>
            <div className="colorShowcaseContainer w70">
                <div className="colorShowcase">
                    {
                        this.props.entry.ColorsRGB.map((clr, j) =>
                            <div className="lineIcon" style={{ "--lineColor": clr, "--contrastColor": ColorUtils.toRGBA(ColorUtils.getContrastColorFor(ColorUtils.toColor01(clr))) } as CSSProperties} key={j}>
                                <div className={`routeNum chars${(j + 1)?.toString().length}`}> {j + 1}</div>
                            </div>)
                    }
                </div>
            </div>
            {this.props.actionButtons &&
                <div className="w20" style={{ flexDirection: "row-reverse", justifySelf: "center", alignSelf: "center", display: "flex" }}>
                    {this.props.actionButtons(this.props.entry)}
                </div>}
        </div>
    }
}
