import { PaletteCategoryCmp, categorizePalettes } from "#components/palettes/PaletteCategoryCmp";
import PaletteLibrarySelectorCmp from "#components/palettes/PaletteLibrarySelectorCmp";
import { PaletteData, PaletteService } from "#service/PaletteService";
import { ArrayUtils } from "#utility/ArrayUtils";
import { ColorUtils } from "#utility/ColorUtils";
import translate from "#utility/translate";
import { CSSProperties, Component } from "react";
import PaletteImportingCmp from "./PaletteImportingCmp";

enum Screen {
    DEFAULT,
    PALETTE_IMPORT_LIB,
    IMPORTING_PALETTE,
    AWAITING_ACTION
}

type State = {
    availablePalettes: PaletteStructureTreeNode,
    currentScreen: Screen,
    paletteBeingImported?: PaletteData
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
            PaletteService.doOnCityPalettesUpdated(() => this.updatePalettes())
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
                    <section style={{ overflow: "scroll", position: "absolute", bottom: 52, left: 5, right: 5, top: 107 }}>
                        {Object.keys(this.state?.availablePalettes.subtrees ?? {}).length == 0 && !this.state?.availablePalettes.rootContent.length
                            ? <h2>No palettes registered! <a onClick={() => this.setState({ currentScreen: Screen.PALETTE_IMPORT_LIB })}>Click here to import!</a></h2>
                            : <PaletteCategoryCmp entry={this.state?.availablePalettes} doWithPaletteData={(x, i) => <PaletteLineViewer entry={x} key={i} />} />}
                    </section>
                    <div style={{ display: "flex", position: "absolute", left: 5, right: 5, bottom: 5 }}>
                        <div className="w70"></div>
                        <button className="positiveBtn w30" onClick={() => this.setState({ currentScreen: Screen.PALETTE_IMPORT_LIB })}>{translate("cityPalettesLibrary.importFromLibrary")}</button>
                    </div>
                </>;
            case Screen.PALETTE_IMPORT_LIB:
                return <PaletteLibrarySelectorCmp onBack={() => this.setState({ currentScreen: Screen.DEFAULT })} actionButtons={(p) => <><button className="positiveBtn" onClick={() => this.goToImportDetails(p)}>{translate('cityPalettesLibrary.copyToCity')}</button></>} />
            case Screen.IMPORTING_PALETTE:
                return <PaletteImportingCmp paletteData={this.state.paletteBeingImported} onBack={() => this.setState({ currentScreen: Screen.PALETTE_IMPORT_LIB })} onOk={(x) => this.doImportPalette(x)} />
            case Screen.AWAITING_ACTION:
                return <div>PLEASE WAIT</div>
        }
    }
    async doImportPalette({ willRandomize, paletteData, paletteNameImport }: { willRandomize: boolean; paletteData: PaletteData; paletteNameImport: string; }) {
        await new Promise((resp) => this.setState({ currentScreen: Screen.AWAITING_ACTION }, () => resp(undefined)));
        await PaletteService.sendPaletteForCity(paletteNameImport, willRandomize ? ArrayUtils.shuffle(paletteData.ColorsRGB) : paletteData.ColorsRGB);
        this.setState({ currentScreen: Screen.DEFAULT });
    }

    goToImportDetails(p: PaletteData): void {
        this.setState({
            paletteBeingImported: p,
            currentScreen: Screen.IMPORTING_PALETTE
        });

    }
}

class PaletteLineViewer extends Component<{ entry: PaletteData }> {
    render() {
        return <div className="paletteViewer">
            <label className="w10" style={{ flexDirection: "column", justifySelf: "center", alignSelf: "center", display: "flex" }}>{this.props.entry.Name}</label>
            <div className="colorShowcaseContainer w50">
                <div className="colorShowcase">
                    {
                        this.props.entry.ColorsRGB.map((clr, j) =>
                            <div className="lineIcon" style={{ "--lineColor": clr, "--contrastColor": ColorUtils.toRGBA(ColorUtils.getContrastColorFor(ColorUtils.toColor01(clr))) } as CSSProperties} key={j}>
                                <div className={`routeNum chars${(j + 1)?.toString().length}`}> {j + 1}</div>
                            </div>)
                    }
                </div>
            </div>

            <div className="w40" style={{ display: "flex", justifySelf: "center", alignSelf: "center", flexDirection: "row-reverse" }}>
                <button>AAA</button>
                <button>BBB</button>
                <button>CCC</button>
            </div>
        </div>
    }
}



