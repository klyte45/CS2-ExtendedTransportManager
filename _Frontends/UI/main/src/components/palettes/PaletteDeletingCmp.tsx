import { PaletteData } from "#service/PaletteService";
import '#styles/PaletteLineViewer.scss';
import translate from "#utility/translate"
import { Component } from "react";
import { PaletteDetailHeaderCmp } from "./PaletteDetailHeaderCmp";
import { DefaultPanelScreen } from "@klyte45/euis-components";

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
        return <DefaultPanelScreen title={translate("paletteDelete.title")} subtitle={translate("paletteDelete.subtitle")} buttonsRowContent={<>
            <button className="negativeBtn" onClick={() => this.props.onOk(this.state.paletteData)}>{translate("paletteDelete.yes")}</button>
            <button className="darkestBtn" onClick={this.props.onBack}>{translate("paletteDelete.no")}</button>
        </>}>
            <PaletteDetailHeaderCmp paletteData={this.props.paletteData} />
        </DefaultPanelScreen>;
    }
}

