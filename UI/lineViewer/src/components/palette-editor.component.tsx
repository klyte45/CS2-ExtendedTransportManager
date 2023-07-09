import { Component } from "react";
import translate from "../utility/translate";
import Cs2Select from "./common/cs2-select";

type State = {
    value: { value: string, label: string }
}

const options = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' },
    { value: 'vanilla2', label: 'Vanilla2' },
    { value: 'vanilla3', label: 'Vanilla3' },
    { value: 'vanilla4', label: 'Vanilla4' },
    { value: 'vanilla5', label: 'Vanilla5' },
    { value: 'vanilla6', label: 'Vanilla6' },
    { value: 'vanilla7', label: 'Vanilla7' },
    { value: 'vanilla8', label: 'Vanilla8' },
    { value: 'vanilla9', label: 'Vanilla9' },
    { value: 'vanilla10', label: 'Vanilla10' },
    { value: 'vanilla12', label: 'Vanilla12' },
    { value: 'vanilla13', label: 'Vanilla13' },
    { value: 'vanilla14', label: 'Vanilla14' },
    { value: 'vanilla15', label: 'Vanilla15' },
    { value: 'vanilla16', label: 'Vanilla16' },
    { value: 'vanilla17', label: 'Vanilla17' },
    { value: 'vanilla18', label: 'Vanilla18' },
    { value: 'vanilla19', label: 'Vanilla19' },
    { value: 'vanilla11', label: 'Vanilla11' },
    { value: 'vanilla22', label: 'Vanilla22' },
    { value: 'vanilla23', label: 'Vanilla23' },
    { value: 'vanilla24', label: 'Vanilla24' },
    { value: 'vanilla25', label: 'Vanilla25' },
    { value: 'vanilla26', label: 'Vanilla26' },
    { value: 'vanilla27', label: 'Vanilla27' },
    { value: 'vanilla28', label: 'Vanilla28' },
    { value: 'vanilla29', label: 'Vanilla29' },
    { value: 'vanilla21', label: 'Vanilla21' }
]

export default class PaletteEditor extends Component<any, State> {
    render() {
        return <>
            <h1>{translate("palettes.title")}</h1>
            <section>
                <h2>{translate("modalSettings")}</h2>
                <div className="sectionColumnContainer">
                    <section className="w50">
                        <h3>{translate("passengerModalsTitle")}</h3>
                        <div className="valueConainerDD">
                            <label>TST</label>
                            <Cs2Select options={options} value={this.state?.value} onChange={(x) => this.setState({ value: x })} />
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