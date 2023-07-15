import { PaletteData, PaletteService } from "#service/PaletteService";
import translate from "#utility/translate";
import { Component } from "react";
import { PaletteCategoryCmp, categorizePalettes } from "#components/palettes/PaletteCategoryCmp";
import '#styles/PaletteLineViewer.scss'
import { PaletteLineViewer } from "./PaletteLineViewer";

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
            {this.props.onBack && <div style={{ display: "flex", position: "absolute", left: 5, right: 5, bottom: 5, flexDirection: "row-reverse" }}>
                <button className="negativeBtn" onClick={this.props.onBack}>{translate("palettesLibrary.back")}</button>
            </div>}
        </>;
    }
}


