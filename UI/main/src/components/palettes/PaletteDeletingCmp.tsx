import { PaletteData, PaletteService } from "#service/PaletteService";
import translate from "#utility/translate";
import { Component, ReactNode } from "react";
import { ExtendedPaletteData, PaletteCategoryCmp, categorizePalettes } from "#components/palettes/PaletteCategoryCmp";
import '#styles/PaletteLineViewer.scss'
import { Checkbox } from "#components/common/checkbox";
import { Input } from "#components/common/input";
import { PaletteDetailHeaderCmp } from "./PaletteDetailHeaderCmp";

type State = {
    paletteData: PaletteData,
}


type Props = {
    paletteData: PaletteData
    onBack: () => void,
    onOk: (paletteData: PaletteData) => void
}



export default class PaletteDeletingCmp extends Component<Props, State> {

    constructor(props: Props | Readonly<Props>) {
        super(props);
        this.state = {
            paletteData: props.paletteData,
        }
    }

    render() {
        return <>
            <h1>{translate("paletteDelete.title")}</h1>
            <h3>{translate("paletteDelete.subtitle")}</h3>
            <section style={{ overflow: "scroll", position: "absolute", bottom: this.props.onBack ? 52 : 0, left: 5, right: 5, top: 107 }}>
                <PaletteDetailHeaderCmp paletteData={this.props.paletteData} />
            </section>
            <div style={{ display: "flex", position: "absolute", left: 5, right: 5, bottom: 5, flexDirection: "row-reverse" }}>
                <button className="negativeBtn" onClick={() => this.props.onOk(this.state.paletteData)}>{translate("paletteDelete.yes")}</button>
                <button className="darkestBtn" onClick={this.props.onBack}>{translate("paletteDelete.no")}</button>
            </div>
        </>;
    }
}

