import { CSSProperties, Component } from "react";
import { NameCustom, NameFormatted, NameLocalized, nameToString } from "#utility/name.utils";
import { Color01, ColorUtils } from "#utility/ColorUtils";
import { TransportType } from "#enum/TransportType";
import { Entity } from "#utility/Entity";
import { SimpleInput } from "./common/input";

type LineData = {
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
            engine.on("k45::xtm.lineViewer.onLinesUpdated", () => this.reloadLines());
        })
        this.reloadLines();
    }
    async reloadLines() {
        var res: LineData[] = await engine.call("k45::xtm.lineViewer.getCityLines")
        console.log(res);
        this.setState({
            linesList: res.sort((a, b) => {
                if (a.type != b.type) return a.type.localeCompare(b.type);
                if (a.isCargo != b.isCargo) return a.isCargo ? 1 : -1;
                return a.routeNumber - b.routeNumber
            })
        });
    }
    render() {
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
            </div>
            {this.state.linesList.map((x, i) => {

                return <div key={i} className="tableRegularRow">
                    <div className="w05">{x.entity.Index}</div>
                    <div className="w05"><SimpleInput onValueChanged={(y) => this.sendAcronym(x.entity, y)} maxLength={32} getValue={() => x.xtmData?.Acronym ?? ""} /></div>
                    <div className="w05"><SimpleInput onValueChanged={(y) => this.sendRouteNumber(x, y)} maxLength={9} getValue={() => x.routeNumber.toFixed()} /></div>
                    <div className="w20 lineIconParent">
                        <div className={`lineIcon`} style={{ "--lineColor": x.color, "--contrastColor": ColorUtils.toRGBA(ColorUtils.getContrastColorFor(ColorUtils.toColor01(x.color))) } as CSSProperties}>
                            <div className={`routeNum chars${(x.xtmData?.Acronym || x.routeNumber?.toString()).length}`}>{x.xtmData?.Acronym || x.routeNumber}</div>
                        </div>
                        <SimpleInput onValueChanged={(y) => this.sendRouteName(x, y)} getValue={() => nameToString(x.name)} />
                    </div>
                    <div className="w05">{x.vehicles}</div>
                    <div className="w10">{(x.length / 1000).toFixed(2) + " km"}</div>
                    <div className="w05">{x.type}</div>
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
            console.log("sending: " + entity.Index + "|" + newAcronym)
            const response = await engine.call("k45::xtm.lineViewer.setAcronym", entity, newAcronym)
            console.log("Response: " + response);
            return response;
        } catch (e) {
            console.warn(e);
        }
    }
    async sendRouteNumber(lineData: LineData, newNumber: string) {
        const numberParsed = parseInt(newNumber);
        if (isFinite(numberParsed)) {
            const response: number = await engine.call("k45::xtm.lineViewer.setRouteNumber", lineData.entity, numberParsed)
            console.log("Response: " + response);
            return response.toFixed();
        }
        return lineData.routeNumber?.toString();
    }
}

