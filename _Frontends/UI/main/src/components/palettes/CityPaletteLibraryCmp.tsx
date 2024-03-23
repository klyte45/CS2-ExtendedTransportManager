import { PaletteCategoryCmp, categorizePalettes } from "#components/palettes/PaletteCategoryCmp";
import PaletteLibrarySelectorCmp from "#components/palettes/PaletteLibrarySelectorCmp";
import { PaletteData, PaletteService } from "#service/PaletteService";
import { ArrayUtils, GameScrollComponent } from "@klyte45/euis-components";
import translate from "#utility/translate"
import { Component } from "react";
import PaletteDeletingCmp from "./PaletteDeletingCmp";
import PaletteEditorCmp from "./PaletteEditorCmp";
import PaletteImportingCmp from "./PaletteImportingCmp";
import { PaletteLineViewer } from "./PaletteLineViewer";

enum Screen {
    DEFAULT,
    PALETTE_IMPORT_LIB,
    IMPORTING_PALETTE,
    AWAITING_ACTION,
    DELETE_CONFIRM,
    EDIT_PALETTE
}

type State = {
    availablePalettes: PaletteStructureTreeNode,
    currentScreen: Screen,
    paletteBeingImported?: PaletteData,
    paletteBeingDeleted?: PaletteData,
    paletteBeingEdited?: PaletteData,
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
                    <section style={{ position: "absolute", bottom: 52, left: 5, right: 5, top: 107 }}>
                        <GameScrollComponent>
                            {Object.keys(this.state?.availablePalettes.subtrees ?? {}).length == 0 && !this.state?.availablePalettes.rootContent.length
                                ? <h2>No palettes registered! <a onClick={() => this.setState({ currentScreen: Screen.PALETTE_IMPORT_LIB })}>Click here to import!</a></h2>
                                : <PaletteCategoryCmp entry={this.state?.availablePalettes} doWithPaletteData={(x, i) => <PaletteLineViewer entry={x} key={i} actionButtons={(y) => this.getActionButtons(y)} />} />}
                        </GameScrollComponent>
                    </section>
                    <div style={{ display: "flex", position: "absolute", left: 5, right: 5, bottom: 5, flexDirection: "row-reverse" }}>
                        <button className="positiveBtn " onClick={() => this.setState({ currentScreen: Screen.PALETTE_IMPORT_LIB })}>{translate("cityPalettesLibrary.importFromLibrary")}</button>
                        <button className="positiveBtn " onClick={() => this.goToEdit()}>{translate("cityPalettesLibrary.createNewPalette")}</button>
                    </div>
                </>;
            case Screen.PALETTE_IMPORT_LIB:
                return <PaletteLibrarySelectorCmp onBack={() => this.setState({ currentScreen: Screen.DEFAULT })} actionButtons={(p) => <><button className="positiveBtn" onClick={() => this.goToImportDetails(p)}>{translate('cityPalettesLibrary.copyToCity')}</button></>} />
            case Screen.IMPORTING_PALETTE:
                return <PaletteImportingCmp paletteData={this.state.paletteBeingImported} onBack={() => this.setState({ currentScreen: Screen.PALETTE_IMPORT_LIB })} onOk={(x) => this.doImportPalette(x)} />
            case Screen.AWAITING_ACTION:
                return <div>PLEASE WAIT</div>
            case Screen.DELETE_CONFIRM:
                return <PaletteDeletingCmp onBack={() => this.setState({ currentScreen: Screen.DEFAULT })} onOk={(x) => this.doDelete(x)} paletteData={this.state.paletteBeingDeleted} />
            case Screen.EDIT_PALETTE:
                return <PaletteEditorCmp onBack={() => this.setState({ currentScreen: Screen.DEFAULT })} onOk={(x) => this.doUpdate(x.paletteData)} paletteData={this.state.paletteBeingEdited} />
        }
    }
    getActionButtons(x: PaletteData): JSX.Element {
        return <>
            <button className="negativeBtn" onClick={() => this.goToDelete(x)}>{translate("cityPalettesLibrary.deletePalette")}</button>
            <button className="neutralBtn" onClick={() => this.goToEdit(x)}>{translate("cityPalettesLibrary.editPalette")}</button>
        </>
    }
    goToEdit(x?: PaletteData): void {
        this.setState({
            paletteBeingEdited: x ?? { ColorsRGB: [], Name: "<?>", GuidString: null, ChecksumString: "" },
            currentScreen: Screen.EDIT_PALETTE
        })
    }
    goToDelete(x: PaletteData): void {
        this.setState({
            paletteBeingDeleted: x,
            currentScreen: Screen.DELETE_CONFIRM
        });
    }

    async doDelete(x: PaletteData) {
        await new Promise((resp) => this.setState({ currentScreen: Screen.AWAITING_ACTION }, () => resp(undefined)));
        await PaletteService.deletePaletteFromCity(x.GuidString);
        this.setState({ currentScreen: Screen.DEFAULT });
    }

    async doImportPalette({ willRandomize, paletteData, paletteNameImport }: { willRandomize: boolean; paletteData: PaletteData; paletteNameImport: string; }) {
        await new Promise((resp) => this.setState({ currentScreen: Screen.AWAITING_ACTION }, () => resp(undefined)));
        await PaletteService.sendPaletteForCity(paletteNameImport, willRandomize ? ArrayUtils.shuffle(paletteData.ColorsRGB) : paletteData.ColorsRGB);
        this.setState({ currentScreen: Screen.DEFAULT });
    }

    async doUpdate(paletteData: Omit<PaletteData, "ChecksumString">) {
        await new Promise((resp) => this.setState({ currentScreen: Screen.AWAITING_ACTION }, () => resp(undefined)));
        if (paletteData.GuidString) {
            await PaletteService.updatePalette(paletteData.GuidString, paletteData.Name, paletteData.ColorsRGB);
        } else {
            await PaletteService.sendPaletteForCity(paletteData.Name, paletteData.ColorsRGB)
        }
        this.setState({ currentScreen: Screen.DEFAULT });
    }
    goToImportDetails(p: PaletteData): void {
        this.setState({
            paletteBeingImported: p,
            currentScreen: Screen.IMPORTING_PALETTE
        });

    }
}



