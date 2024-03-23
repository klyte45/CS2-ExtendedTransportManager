import { LineData, LineManagementService } from "#service/LineManagementService";
import { ColorUtils, Entity, GameScrollComponent, NameCustom, NameFormatted, SimpleInput, nameToString } from "@klyte45/euis-components";
import { Component } from "react";
import LineDetailCmp from "./LineDetailCmp";
import { TlmLineFormatCmp } from "./containers/TlmLineFormatCmp";
import "#styles/LineList.scss"
import translate from "#utility/translate";
import { TransportType } from "#enum/TransportType";

type State = {
    linesList: LineData[],
    indexedLineList: Record<string, LineData>
    currentLineViewer?: LineData
}

const TypeToIcons = {
    [`${TransportType.Bus}.false`]: "coui://GameUI/Media/Game/Icons/BusLine.svg",
    [`${TransportType.Airplane}.false`]: "coui://GameUI/Media/Game/Icons/PassengerplaneLine.svg",
    [`${TransportType.Airplane}.true`]: "coui://GameUI/Media/Game/Icons/CargoplaneLine.svg",
    [`${TransportType.Ship}.false`]: "coui://GameUI/Media/Game/Icons/PassengershipLine.svg",
    [`${TransportType.Ship}.true`]: "coui://GameUI/Media/Game/Icons/CargoshiipLine.svg",
    [`${TransportType.Train}.false`]: "coui://GameUI/Media/Game/Icons/TrainLine.svg",
    [`${TransportType.Train}.true`]: "coui://GameUI/Media/Game/Icons/CargoTrainLine.svg",
    [`${TransportType.Tram}.false`]: "coui://GameUI/Media/Game/Icons/TramLine.svg",
    [`${TransportType.Subway}.false`]: "coui://GameUI/Media/Game/Icons/SubwayLine.svg",
}


export default class LineListCmp extends Component<any, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            linesList: [],
            indexedLineList: {}
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
        const lineList = res.sort((a, b) => {
            if (a.type != b.type) return a.type.localeCompare(b.type, undefined, { sensitivity: "base" });
            if (a.isCargo != b.isCargo) return a.isCargo ? 1 : -1;
            return a.routeNumber - b.routeNumber
        });
        this.setState({
            linesList: lineList,
            indexedLineList: lineList.reduce((p, n) => {
                p[n.entity.Index.toFixed(0)] = n;
                return p;
            }, {})
        });
        if (!this.state.currentLineViewer) {
            engine.call("k45::xtm.lineViewer.getCityLines", false)
        }
    }
    render() {
        if (this.state.currentLineViewer) {
            return <><LineDetailCmp
                currentLine={this.state.currentLineViewer?.entity}
                onBack={() => this.setState({ currentLineViewer: undefined, }, () => engine.call("k45::xtm.lineViewer.getCityLines", true))}
                getLineById={(x) => this.getLineById(x)}
                setSelection={x => this.setSelection(x)}
                onForceReload={() => engine.call("k45::xtm.lineViewer.getCityLines", true)}
            /></>
        }
        return <>
            <h1>{translate("lineList.title")}</h1>
            <h3>{translate("lineList.subtitle")}</h3>
            <section style={{ position: "absolute", bottom: 52, left: 5, right: 5, top: 107 }} className="LineList">
                <GameScrollComponent>
                    {this.state.linesList.map((x, i) => {
                        const fontColor = ColorUtils.toRGBA(ColorUtils.getContrastColorFor(ColorUtils.toColor01(x.color)));
                        const effectiveIdentifier = x.xtmData?.Acronym || x.routeNumber.toFixed();

                        return <div key={i} className="BgItem">
                            <div onClick={() => this.setState({ currentLineViewer: x })} className="lineAcronym" style={{
                                "--xtm-line-color": ColorUtils.getClampedColor(x.color),
                                "--xtm-font-color": fontColor,
                                "--xtm-font-multiplier": effectiveIdentifier.length < 2 ? 1 : 1 / Math.min(4, effectiveIdentifier.length - 1),
                                "--xtm-game-icon": `url(${TypeToIcons[`${x.type}.${x.isCargo}`]})`
                            } as any}>
                                <div className="text">{effectiveIdentifier}</div>
                                <TlmLineFormatCmp className="icon" {...x} borderWidth="2px" contentOverride={<div className="gameIcon"></div>} />
                            </div>
                            <div className="lineName">{nameToString(x.name)}</div>
                            <div className="lineType">{`${x.type} - ${x.isCargo ? "Cargo" : "Passenger"}`}</div>
                            <div className="lineLength">{(x.length / 1000).toFixed(2) + " km"}</div>
                            <div className="lineVehicles">{x.vehicles + " Vehicles"}</div>

                        </div>;
                        <div key={i} className="tableRegularRow">
                            <div className="w05">{x.entity.Index}</div>
                            <div className="w05"><SimpleInput onValueChanged={(y) => this.sendAcronym(x.entity, y)} maxLength={32} getValue={() => x.xtmData?.Acronym ?? ""} /></div>
                            <div className="w05"><SimpleInput onValueChanged={(y) => this.sendRouteNumber(x, y)} maxLength={9} getValue={() => x.routeNumber.toFixed()} /></div>
                            <div className="w20">
                                <div className="tlmIconParent">
                                    <TlmLineFormatCmp {...x} text={x.xtmData?.Acronym ?? x.routeNumber.toFixed()} />
                                </div>
                                <SimpleInput onValueChanged={(y) => this.sendRouteName(x, y)} getValue={() => nameToString(x.name)} />
                            </div>
                            <div className="w05">{x.vehicles}</div>
                            <div className="w10">{(x.length / 1000).toFixed(2) + " km"}</div>
                            <div className="w05">{x.type}</div>
                            <div className="w05" onClick={() => this.setState({ currentLineViewer: x })} >GO</div>
                        </div>;
                    })}
                </GameScrollComponent>
            </section>
            <section style={{ position: "absolute", bottom: 1, left: 5, right: 5, height: 50 }}>
            </section>
        </>;
    }
    async setSelection(x: Entity) {
        return new Promise<void>((res) => this.setState({ currentLineViewer: this.state.indexedLineList[x.Index.toFixed(0)] }, () => res(null)))
    }
    getLineById(x: number): LineData {
        return this.state.indexedLineList[x.toFixed(0)];
    }
    async sendRouteName(lineData: LineData, newName: string) {
        const response: NameFormatted | NameCustom = await LineManagementService.setLineName(lineData.entity, newName)

        engine.call("k45::xtm.lineViewer.getCityLines", true)
        return nameToString(response);
    }

    async sendAcronym(entity: Entity, newAcronym: string) {
        try {
            const response = await LineManagementService.setLineAcronym(entity, newAcronym);

            engine.call("k45::xtm.lineViewer.getCityLines", true)
            return response;
        } catch (e) {
            console.warn(e);
        }
    }
    async sendRouteNumber(lineData: LineData, newNumber: string) {
        const numberParsed = parseInt(newNumber);
        if (isFinite(numberParsed)) {
            const response: number = await engine.call("k45::xtm.lineViewer.setRouteNumber", lineData.entity, numberParsed)

            engine.call("k45::xtm.lineViewer.getCityLines", true)
            return response.toFixed();
        }
        return lineData.routeNumber?.toString();
    }
}

