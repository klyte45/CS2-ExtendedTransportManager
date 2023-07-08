import { Component } from "react";
import translate from "../utility/translate";

type State = {

}


export default class PaletteEditor extends Component<any, State> {
    render() {
        return <>
            <h1>{translate("palettes.title")}</h1>
            <section>
                <h2>{translate("modalSettings")}</h2>
                <div className="sectionColumnContainer">
                    <section className="w50">
                        <h3>{translate("passengerModalsTitle")}</h3>
                        <div>
                            <label>TST</label>
                            <select>
                                <option>opt1</option>
                                <option>opt2</option>
                                <option>opt3</option>
                                <option>opt4</option>
                            </select>
                        </div>
                    </section>
                    <section className="w50">
                        <h3>{translate("cargoModalsTitle")}</h3>
                    </section>
                </div>
            </section>
        </>;
    }
}