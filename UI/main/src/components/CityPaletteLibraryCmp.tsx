import { CSSProperties, Component } from "react";
import translate from "#utility/translate";
import { PaletteService, PaletteData } from "#service/PaletteService";
import { ColorUtils } from "#utility/ColorUtils";
import { ObjectTyped } from "object-typed";
import { PaletteCategoryCmp, categorizePalettes } from "./common/PaletteCategoryCmp";
import PaletteLibrarySelectorCmp from "./PaletteLibrarySelectorCmp";

enum Screen {
    DEFAULT,
    PALETTE_IMPORT_LIB
}

type State = {
    availablePalettes: PaletteStructureTreeNode,
    currentScreen: Screen
}

export type PaletteStructureTreeNode = {
    rootContent: PaletteData[],
    subtrees: Record<string, PaletteStructureTreeNode>
}



export default class CityPaletteLibraryCmp extends Component<any, State> {

    constructor(props) {
        super(props);
        this.state = {
            availablePalettes: { subtrees: {}, rootContent: [] },
            currentScreen: Screen.DEFAULT
        }
    }
    componentDidMount() {
        const _this = this;
        engine.whenReady.then(async () => {
            this.updatePalettes();
        })
    }
    private async updatePalettes() {
        const palettesSaved = await PaletteService.listCityPalettes();
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
        switch (this.state.currentScreen) {
            case Screen.DEFAULT:
                return <>
                    <h1>{translate("cityPalettesLibrary.title")}</h1>
                    <h3>{translate("cityPalettesLibrary.subtitle")}</h3>
                    <section>
                        {Object.keys(this.state?.availablePalettes.subtrees ?? {}).length == 0 && !this.state?.availablePalettes.rootContent.length
                            ? <h2>No palettes registered! <a onClick={() => this.setState({ currentScreen: Screen.PALETTE_IMPORT_LIB })}>Click here to import!</a></h2>
                            : <PaletteCategoryCmp entry={this.state?.availablePalettes} doWithPaletteData={(x, i) => <PaletteLineViewer entry={x} key={i} />} />}
                    </section>
                </>;
            case Screen.PALETTE_IMPORT_LIB:
                return <PaletteLibrarySelectorCmp onBack={() => this.setState({ currentScreen: Screen.DEFAULT })} actionButtons={(p) => <><button className="positiveBtn" onClick={() => this.askName(p)}>{translate('cityPalettesLibrary.copyToCity')}</button></>} />
        }
    }
    askName(p: PaletteData): void {
        console.log("AAAAAAAAAAAAAAA");
    }
}

class PaletteLineViewer extends Component<{ entry: PaletteData }> {
    render() {
        return <div className="paletteViewer">
            <label className="w10">{this.props.entry.Name}</label>
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

            <div className="colorShowcaseContainer w20">
                <button>AAA</button>
                <button>BBB</button>
                <button>CCC</button>
            </div>
        </div>
    }
}



