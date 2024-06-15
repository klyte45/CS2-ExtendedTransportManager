import { PaletteData, PaletteService } from "#service/PaletteService";
import translate from "#utility/translate"
import { Component } from "react";
import { PaletteCategoryCmp, categorizePalettes } from "#components/palettes/PaletteCategoryCmp";
import '#styles/PaletteLineViewer.scss'
import { PaletteLineViewer } from "./PaletteLineViewer";
import { DefaultPanelScreen } from "@klyte45/euis-components";

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
        return <DefaultPanelScreen title={translate("palettesLibrary.title")} subtitle={translate("palettesLibrary.subtitle")} buttonsRowContent={
            <>
                {this.props.onBack && <button className="negativeBtn" onClick={this.props.onBack}>{translate("palettesLibrary.back")}</button>}
                <button className="neutralBtn" onClick={() => PaletteService.openPalettesFolder()}>{translate("cityPalettesLibrary.goToLib")}</button>
                <button className="neutralBtn" onClick={() => PaletteService.reloadPalettes().then(x => this.updatePalettes())}>{translate("palettesLibrary.reloadPalettes")}</button>
            </>
        }>
            <PaletteCategoryCmp entry={this.state?.availablePalettes} doWithPaletteData={(x, i) => <PaletteLineViewer entry={x} key={i} actionButtons={this.props.actionButtons} />} />
        </DefaultPanelScreen>;
    }
}


