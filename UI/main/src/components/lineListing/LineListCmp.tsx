import { CSSProperties, Component } from "react";
import { NameCustom, NameFormatted, NameLocalized, nameToString } from "#utility/name.utils";
import { Color01, ColorUtils } from "#utility/ColorUtils";
import { TransportType } from "#enum/TransportType";
import { Entity } from "#utility/Entity";
import { SimpleInput } from "../common/input";
import LineDetailCmp from "./LineDetailCmp";
import { TlmLineFormatCmp } from "./containers/TlmLineFormatCmp";

export type LineData = {
    __Type: string,
    name: NameCustom | NameFormatted,
    vkName: NameLocalized,
    entity: Entity,
    color: string
    cargo: number,
    active: boolean,
    visible: boolean,
    isCargo: boolean,
    length: number,
    schedule: number,
    stops: number,
    type: TransportType,
    usage: number,
    vehicles: number,
    xtmData?: {
        Acronym: string
    }
    routeNumber: number
}

type State = {
    linesList: LineData[]
    currentLineViewer?: LineData
}


export default class LineListCmp extends Component<any, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            linesList: []
        }
    }
    componentDidMount() {
        engine.whenReady.then(async () => {
            engine.on("k45::xtm.lineViewer.getCityLines->", (x) => {
                this.reloadLines(x);
            });
        })
        engine.call("k45::xtm.lineViewer.getCityLines", true)
    }

    componentWillUnmount(): void {
        engine.off("k45::xtm.lineViewer.getCityLines->");
    }

    async reloadLines(res: LineData[]) {
        this.setState({
            linesList: res.sort((a, b) => {
                if (a.type != b.type) return a.type.localeCompare(b.type);
                if (a.isCargo != b.isCargo) return a.isCargo ? 1 : -1;
                return a.routeNumber - b.routeNumber
            })
        });
        if (!this.state.currentLineViewer) {
            engine.call("k45::xtm.lineViewer.getCityLines", false)
        }
    }
    render() {
        if (this.state.currentLineViewer) {
            return <><LineDetailCmp currentLine={this.state.currentLineViewer} onBack={() => this.setState({ currentLineViewer: undefined, }, () => engine.call("k45::xtm.lineViewer.getCityLines", true))} /></>
        }
        return <>
            <h1>List of lines</h1>
            <div className="tableTopRow">
                <div className="w05">Identifier</div>
                <div className="w05">Acronym</div>
                <div className="w05">Number</div>
                <div className="w20">Name</div>
                <div className="w05">Vehicles</div>
                <div className="w10">Length</div>
                <div className="w05">Type</div>
                <div className="w05">Details</div>
            </div>
            {this.state.linesList.map((x, i) => {

                return <div key={i} className="tableRegularRow">
                    <div className="w05">{x.entity.Index}</div>
                    <div className="w05"><SimpleInput onValueChanged={(y) => this.sendAcronym(x.entity, y)} maxLength={32} getValue={() => x.xtmData?.Acronym ?? ""} /></div>
                    <div className="w05"><SimpleInput onValueChanged={(y) => this.sendRouteNumber(x, y)} maxLength={9} getValue={() => x.routeNumber.toFixed()} /></div>
                    <div className="w20">
                        <div className="tlmIconParent">
                            <TlmLineFormatCmp lineCommonData={x} />
                        </div>
                        <SimpleInput onValueChanged={(y) => this.sendRouteName(x, y)} getValue={() => nameToString(x.name)} />
                    </div>
                    <div className="w05">{x.vehicles}</div>
                    <div className="w10">{(x.length / 1000).toFixed(2) + " km"}</div>
                    <div className="w05">{x.type}</div>
                    <div className="w05" onClick={() => this.setState({ currentLineViewer: x })} >GO</div>
                </div>;
            })}
        </>;
    }
    async sendRouteName(lineData: LineData, newName: string) {
        const response: NameFormatted | NameCustom = await engine.call("k45::xtm.lineViewer.setRouteName", lineData.entity, newName)
        return nameToString(response);
    }

    async sendAcronym(entity: Entity, newAcronym: string) {
        try {
            const response = await engine.call("k45::xtm.lineViewer.setAcronym", entity, newAcronym)
            return response;
        } catch (e) {
            console.warn(e);
        }
    }
    async sendRouteNumber(lineData: LineData, newNumber: string) {
        const numberParsed = parseInt(newNumber);
        if (isFinite(numberParsed)) {
            const response: number = await engine.call("k45::xtm.lineViewer.setRouteNumber", lineData.entity, numberParsed)
            return response.toFixed();
        }
        return lineData.routeNumber?.toString();
    }
}

