import { PaletteData } from "#service/PaletteService";
import '#styles/PaletteLineViewer.scss';
import { Cs2CheckboxWithLine, DefaultPanelScreen, Input } from "@klyte45/euis-components";
import translate from "#utility/translate"
import { Component } from "react";
import { PaletteDetailHeaderCmp } from "./PaletteDetailHeaderCmp";

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
        return <DefaultPanelScreen title={translate("palettesImport.title")} subtitle={translate("palettesImport.subtitle")} buttonsRowContent={<>
            <button className="negativeBtn " onClick={this.props.onBack}>{translate("palettesImport.cancel")}</button>
            <button className="positiveBtn " onClick={() => this.props.onOk(this.state)}>{translate("palettesImport.import")}</button>
        </>}>
            <PaletteDetailHeaderCmp paletteData={this.props.paletteData} />
            <div>
                <Input title={translate("palettesImport.cityImportName")} getValue={() => this.state.paletteNameImport} onValueChanged={(x) => { this.setState({ paletteNameImport: x }); return x; }} />
            </div>
            <div>
                <Cs2CheckboxWithLine isChecked={() => this.state.willRandomize} onValueToggle={(x) => this.setState({ willRandomize: x })} title={translate("palettesImport.randomizeColorOrder")} />
            </div>
        </DefaultPanelScreen>;
    }
}

