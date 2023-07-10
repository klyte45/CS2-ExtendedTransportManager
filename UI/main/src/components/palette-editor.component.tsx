import { Component } from "react";
import translate from "#utility/translate";
import Cs2Select from "./common/cs2-select";
import { TransportType } from "#enum/TransportType";
import { PaletteData, PaletteService } from "#service/palette.service";
import { ObjectTyped } from "object-typed";

type State = {
    availablePalettes: Record<string, PaletteData>,
    availablePassenger: TransportType[],
    availableCargo: TransportType[],
    passengerSettings: Partial<Record<TransportType, string>>,
    cargoSettings: Partial<Record<TransportType, string>>
}

function cargoNameFor(modal: TransportType) {
    return engine.translate(`Transport.ROUTES[${modal}]`);
}
function passengerNameFor(modal: TransportType) {
    return engine.translate(`Transport.LINES[${modal}]`);
}



export default class PaletteEditor extends Component<any, State> {

    constructor(props) {
        super(props);
        this.state = {
            availableCargo: [],
            availablePalettes: {},
            availablePassenger: [],
            cargoSettings: {},
            passengerSettings: {}
        }
    }
    componentDidMount() {
        const _this = this;
        engine.whenReady.then(async () => {
            PaletteService.cargoModalAvailable().then(x => _this.setState({ availableCargo: x }))
            this.updatePalettes();
            PaletteService.passengerModalAvailable().then(x => _this.setState({ availablePassenger: x }))
            PaletteService.passengerModalSettings().then(x => _this.setState({ passengerSettings: x }))
            PaletteService.cargoModalSettings().then(x => _this.setState({ cargoSettings: x }))
        })
    }
    private async updatePalettes() {
        const palettesSaved = await PaletteService.listPalettes();
        const defaultOptions = ([[void 0,
        {
            Name: translate("autoColorDisabled")
        } as PaletteData]] as [string, PaletteData][])
        this.setState({
            availablePalettes: ObjectTyped.fromEntries(defaultOptions.concat(palettesSaved.sort((a, b) => a.Name.localeCompare(b.Name)).map(x => [x.GuidString, x])) as [string, PaletteData][])
        });
    }

    render() {
        return <>
            <h1>{translate("palettes.title")}</h1>
            <section>
                <h2>{translate("modalSettings")}</h2>
                <div className="sectionColumnContainer">
                    <section className="w50">
                        <h3>{translate("passengerModalsTitle")}</h3>
                        {this.state.availablePassenger.map((tt, i) => {
                            return <div className="valueConainerDD" key={i}>
                                <label>{passengerNameFor(tt)}</label>
                                <Cs2Select
                                    options={Object.values(this.state.availablePalettes)}
                                    getOptionLabel={(x) => x?.Name}
                                    getOptionValue={(x) => x?.GuidString}
                                    onChange={(x) => this.setPassengerPaletteGuid(tt, x.GuidString)}
                                    value={this.state.availablePalettes[this.state.passengerSettings[tt]]}
                                />
                            </div>
                        })}
                    </section>
                    <section className="w50">
                        <h3>{translate("cargoModalsTitle")}</h3>
                        {this.state.availableCargo.map((tt, i) => {
                            return <div className="valueConainerDD" key={i}>
                                <label>{passengerNameFor(tt)}</label>
                                <Cs2Select
                                    options={Object.values(this.state.availablePalettes)}
                                    getOptionLabel={(x) => x?.Name}
                                    getOptionValue={(x) => x?.GuidString}
                                    onChange={(x) => this.setCargoPaletteGuid(tt, x.GuidString)}
                                    value={this.state.availablePalettes[this.state.cargoSettings[tt]]}
                                />
                            </div>
                        })}
                    </section>
                </div>
            </section>
        </>;
    }
    setPassengerPaletteGuid(tt: TransportType, x: string): void {

    }
    setCargoPaletteGuid(tt: TransportType, x: string): void {

    }
}