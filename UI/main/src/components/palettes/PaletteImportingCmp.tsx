import { PaletteData, PaletteService } from "#service/PaletteService";
import translate from "#utility/translate";
import { Component, ReactNode } from "react";
import { ExtendedPaletteData, PaletteCategoryCmp, categorizePalettes } from "#components/palettes/PaletteCategoryCmp";
import '#styles/PaletteLineViewer.scss'
import { Checkbox } from "#components/common/checkbox";
import { Input } from "#components/common/input";
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
        return <>
            <h1>{translate("palettesImport.title")}</h1>
            <h3>{translate("palettesImport.subtitle")}</h3>
            <section style={{ overflow: "scroll", position: "absolute", bottom: this.props.onBack ? 52 : 0, left: 5, right: 5, top: 107 }}>
                <PaletteDetailHeaderCmp paletteData={this.props.paletteData} />
                <div>
                    <Input title={translate("palettesImport.cityImportName")} getValue={() => this.state.paletteNameImport} onValueChanged={(x) => { this.setState({ paletteNameImport: x }); return x; }} />
                </div>
                <div>
                    <Checkbox isChecked={() => this.state.willRandomize} onValueToggle={(x) => this.setState({ willRandomize: x })} title={translate("palettesImport.randomizeColorOrder")} />
                </div>
                <div>
                </div>
            </section>
            <div style={{ display: "flex", position: "absolute", left: 5, right: 5, bottom: 5, flexDirection: "row-reverse" }}>
                <button className="negativeBtn " onClick={this.props.onBack}>{translate("palettesImport.cancel")}</button>
                <button className="positiveBtn " onClick={() => this.props.onOk(this.state)}>{translate("palettesImport.import")}</button>
            </div>
        </>;
    }
}
