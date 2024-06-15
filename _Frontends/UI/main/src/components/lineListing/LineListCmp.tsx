import { LineData, LineManagementService } from "#service/LineManagementService";
import { ColorUtils, DefaultPanelScreen, Entity, GameScrollComponent, NameCustom, NameFormatted, NameType, SimpleInput, UnitSettings, getGameUnits, metersTo, nameToString, replaceArgs, translateUnitResult } from "@klyte45/euis-components";
import { Component } from "react";
import LineDetailCmp from "./LineDetailCmp";
import { TlmLineFormatCmp } from "./containers/TlmLineFormatCmp";
import "#styles/LineList.scss"
import translate from "#utility/translate";
import { TransportType } from "#enum/TransportType";

type State = {
    linesList: LineData[],
    indexedLineList: Record<string, LineData>
    currentLineViewer?: LineData,
    unitsData?: UnitSettings,
    filterExclude: string[]
}

const TypeToIcons = {
    [`${TransportType.Bus}.false`]: "coui://GameUI/Media/Game/Icons/BusLine.svg",
    [`${TransportType.Tram}.false`]: "coui://GameUI/Media/Game/Icons/TramLine.svg",
    [`${TransportType.Subway}.false`]: "coui://GameUI/Media/Game/Icons/SubwayLine.svg",
    [`${TransportType.Train}.false`]: "coui://GameUI/Media/Game/Icons/TrainLine.svg",
    [`${TransportType.Ship}.false`]: "coui://GameUI/Media/Game/Icons/PassengershipLine.svg",
    [`${TransportType.Airplane}.false`]: "coui://GameUI/Media/Game/Icons/PassengerplaneLine.svg",
    [`${TransportType.Train}.true`]: "coui://GameUI/Media/Game/Icons/CargoTrainLine.svg",
    [`${TransportType.Ship}.true`]: "coui://GameUI/Media/Game/Icons/CargoshiipLine.svg",
    [`${TransportType.Airplane}.true`]: "coui://GameUI/Media/Game/Icons/CargoplaneLine.svg",
}


export default class LineListCmp extends Component<any, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            linesList: [],
            indexedLineList: {},
            filterExclude: []
        }
    }
    componentDidMount() {
        engine.whenReady.then(async () => {
            engine.on("k45::xtm.lineViewer.getCityLines->", async (x) => {
                getGameUnits().then(x => this.setState({ unitsData: x }))
                this.reloadLines(x)
            });
        })
        engine.call("k45::xtm.lineViewer.getCityLines", true)
    }

    componentWillUnmount(): void {
        engine.off("k45::xtm.lineViewer.getCityLines->");
    }

    async reloadLines(res: LineData[]) {
        const refOrder = Object.keys(TypeToIcons);
        const lineList = res.sort((a, b) => {
            const typeA = `${a.type}.${a.isCargo}`
            const typeB = `${b.type}.${b.isCargo}`

            if (typeA != typeB) return refOrder.indexOf(typeA) - refOrder.indexOf(typeB);
            return a.routeNumber - b.routeNumber
        });
        this.setState({
            linesList: lineList,
            indexedLineList: lineList.reduce((p, n) => {
                p[n.entity.Index.toFixed(0)] = n;
                return p;
            }, {}),
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

        return <DefaultPanelScreen title={translate("lineList.title")} subtitle={translate("lineList.subtitle")}>
            <section style={{ position: "absolute", top: 0, left: 0, right: 0, height: 50 }} className="filterRow">
                {
                    Object.entries(TypeToIcons).map(x => {
                        let splittedType = x[0].split(".")
                        let type = splittedType[0];
                        let isCargo = splittedType[1] == "true";
                        return <button key={x[0]} className={this.state.filterExclude.includes(x[0]) ? "unselected" : ""} onClick={() => this.toggleFilterType(x[0])}>
                            <img src={x[1]} data-tooltip={this.getNameFor(type, isCargo)} />
                        </button>
                    })
                }
                <div className="space" />
                <button className="txt" onClick={() => this.setState({ filterExclude: [] })}>{translate("lineList.showAll")}</button>
                <button className="txt" onClick={() => this.setState({ filterExclude: Object.keys(TypeToIcons) })}>{translate("lineList.hideAll")}</button>
                <button className="txt" onClick={() => this.setState({ filterExclude: Object.keys(TypeToIcons).filter(x => x.endsWith(".true")) })}>{translate("lineList.passengerLines")}</button>
                <button className="txt" onClick={() => this.setState({ filterExclude: Object.keys(TypeToIcons).filter(x => x.endsWith(".false")) })}>{translate("lineList.cargoRoutes")}</button>
                <div className="space" />
                <div className="righter">
                    {replaceArgs(translate("lineList.linesCurrentFilterFormat"), { LINECOUNT: `${this.state.linesList.filter(x => !this.state.filterExclude.includes(`${x.type}.${x.isCargo}`)).length}` })}
                </div>
            </section>
            <section style={{ position: "absolute", top: 50, left: 0, right: 0, bottom: 0 }} className="LineList">
                <GameScrollComponent>
                    {this.state.linesList.map((x, i) => {
                        const typeIndex = `${x.type}.${x.isCargo}`;
                        if (this.state.filterExclude.includes(typeIndex)) return null;

                        const fontColor = ColorUtils.toRGBA(ColorUtils.getContrastColorFor(ColorUtils.toColor01(x.color)));
                        const effectiveIdentifier = x.xtmData?.Acronym || x.routeNumber.toFixed();

                        return <div key={i} className="BgItem">
                            <div onClick={() => this.setState({ currentLineViewer: x })} className="lineAcronym" style={{
                                "--xtm-line-color": ColorUtils.getClampedColor(x.color),
                                "--xtm-font-color": fontColor,
                                "--xtm-font-multiplier": effectiveIdentifier.length < 2 ? 1 : 1 / Math.min(4, effectiveIdentifier.length - 1),
                                "--xtm-game-icon": `url(${TypeToIcons[typeIndex]})`
                            } as any}>
                                <div className="text">{effectiveIdentifier}</div>
                                <TlmLineFormatCmp className="icon" {...x} borderWidth="2px" contentOverride={<div className="gameIcon"></div>} />
                            </div>
                            <div className="lineName">{nameToString(x.name)}</div>
                            <div className="lineType">{this.getNameFor(x.type, x.isCargo)}</div>
                            <div className="lineLength">{translateUnitResult(metersTo(x.length, this.state.unitsData?.unitSystem?.value__ ?? 0))}</div>
                            <div className="lineVehicles">{`${x.vehicles} ${nameToString({
                                nameId: `Transport.LEGEND_VEHICLES[${x.type}]`,
                                __Type: NameType.Localized
                            })}`}</div>

                        </div>;
                    })}
                </GameScrollComponent>
            </section>
        </DefaultPanelScreen>;
    }

    toggleFilterType(type: string) {
        let newVal = this.state.filterExclude.filter(x => x != type);
        if (newVal.length == this.state.filterExclude.length) {
            newVal.push(type);
        }
        this.setState({
            filterExclude: newVal
        })
    }

    getNameFor(type: string, isCargo: boolean) {
        return nameToString({
            nameId: isCargo ? `Transport.ROUTES[${type}]` : `Transport.LINES[${type}]`,
            __Type: NameType.Localized
        })
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

