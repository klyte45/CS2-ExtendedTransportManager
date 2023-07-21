import { DefaultPanelScreen } from "#components/common/DefaultPanelScreen";
import "#styles/TLM_LineDetail.scss";
import "#styles/LineDetailCmp.scss";
import { Entity } from "#utility/Entity";
import { NameCustom, NameFormatted, NameLocalized, nameToString } from "#utility/name.utils";
import translate from "#utility/translate";
import { CSSProperties, Component } from "react";
import { LineData } from "./LineListCmp";


type State = {
    lineDetails?: {
        LineData: LineData,
        StopCapacity: number,
        Stops: {
            entity: Entity,
            position: number,
            cargo: number,
            isCargo: boolean,
            isOutsideConnection: boolean,
            name: NameCustom | NameFormatted,
            parent: Entity,
            parentName: NameCustom | NameFormatted | NameLocalized,
            district: Entity,
            districtName: NameCustom | NameFormatted,
        }[]
        Vehicles: {
            entity: Entity,
            position: number,
            cargo: number,
            capacity: number,
            isCargo: boolean,
            districtName: NameCustom | NameFormatted | NameLocalized,
        }[],
        Segments: {
            start: number,
            end: number,
            sizeMeters: number,
            broken: boolean
        }
    }
}

type Props = {
    currentLine: LineData,
    onBack: () => void
}

export default class LineDetailCmp extends Component<Props, State> {
    constructor(props: any) {
        super(props);
        this.state = {
        }
    }
    componentDidMount() {
        engine.whenReady.then(async () => {
            engine.on("k45::xtm.lineViewer.getRouteDetail->", (x) => {
                console.log(x);
                this.setState({ lineDetails: x });
                this.reloadLines();
            });
        })
        this.reloadLines(true);
    }
    componentWillUnmount(): void {
        engine.off("k45::xtm.lineViewer.getRouteDetail->");
    }

    async reloadLines(force: boolean = false) {
        await engine.call("k45::xtm.lineViewer.getRouteDetail", this.props.currentLine.entity, force);
    }
    render() {
        if (!this.props.currentLine) {
            return <>INVALID</>
        }
        const buttonsRow = <>
            <button className="negativeBtn " onClick={this.props.onBack}>{translate("paletteEditor.cancel")}</button>
        </>
        const lineDetails = this.state.lineDetails;
        const lineCommonData = lineDetails?.LineData;
        return <>
            <DefaultPanelScreen title={nameToString(this.props.currentLine.name)} subtitle="" buttonsRowContent={buttonsRow}>
                <div id="TlmViewer">
                    {!lineDetails ? <></> :
                        <>
                            <div className=" container-fluid  pt-3">
                                <div className="titleRow">
                                    <div className="formatContainer">
                                        <div style={{ "--currentBgColor": lineCommonData.color } as CSSProperties} className={`format ${lineCommonData.type} v???`}>
                                            <div className="before"></div>
                                            <div className="after"></div>
                                        </div>
                                        <div style={{ fontSize: getFontSizeForText(lineCommonData.xtmData?.Acronym || lineCommonData.routeNumber.toFixed()) }} className="num">
                                            {lineCommonData.xtmData?.Acronym || (lineCommonData.routeNumber.toFixed())}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                {lineDetails.Stops[0].district.Index > 0 &&
                                    <div className="districtDiv lineStation row col-12 align-items-center">
                                        <div className="newDistrict">{nameToString(lineDetails.Stops[0].districtName)}</div>
                                    </div>}
                                <div className="linePath" style={{ "--lineColor": getClampedColor(lineCommonData.color) } as CSSProperties}>
                                    <div className="before"></div>
                                    {lineDetails.Stops.map((station, i, arr) => {
                                        const last = arr[i - 1];
                                        const nextStop = arr[(i + 1) % arr.length];
                                        return <div className="lineStationContainer" key={i}>
                                            <div className="lineStation row col-12 align-items-center">
                                                <div className="stationName" >{nameToString(station.name)}</div>
                                                <div className="stationBullet"></div>
                                                <div className="stationIntersections lineStation row align-items-center">
                                                    {([] as any[]).map((lineId: Entity) => {
                                                        if (lineId.Index == lineCommonData.entity.Index) return;
                                                        const otherLine = this.getLineById(lineId);
                                                        return <div className="lineIntersection">
                                                            <div className="formatContainer" title={nameToString(otherLine.name)} style={{ "--scaleFormat": 0.4 } as CSSProperties} onClick={() => this.setSelection(lineId)}>
                                                                <div className={`format ${otherLine.type} v????`} style={{ "--currentBgColor": otherLine.color } as CSSProperties}  >
                                                                    <div className="before"></div>
                                                                    <div className="after"></div>
                                                                </div>
                                                                <div style={{ fontSize: getFontSizeForText(otherLine.xtmData?.Acronym || otherLine.routeNumber.toFixed()) }} className="num">
                                                                    {otherLine.xtmData?.Acronym || otherLine.routeNumber.toFixed()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    })}
                                                </div>
                                            </div>
                                            {nextStop.district.Index != station.district.Index &&
                                                <div className="districtDiv lineStation row col-12 align-items-center">
                                                    <div className="before"></div>
                                                    {station.district.Index > 0 && <div className="oldDistrict" >{nameToString(station.districtName)}</div>}
                                                    {arr[(i + 1) % arr.length].district.Index > 0 && <div className="newDistrict">{nameToString(nextStop.districtName)}</div >}
                                                </div>
                                            }
                                        </div>
                                    })}
                                </div>
                            </div>
                        </>
                    }
                </div>
                <div id="dataPanel">
                    {JSON.stringify(this.state.lineDetails ?? "LOADING")}
                </div>
            </DefaultPanelScreen>
        </>;
    }
    getLineById(lineId: Entity): LineData {
        return {} as any
    }
    setSelection(lineId: Entity): void {
        return {} as any
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

function getFontSizeForText(text: string) {
    switch ((text || "").length) {
        case 1:
            return "52px";
        case 2:
            return "44px";
        case 3:
            return "32px";
        case 4:
            return "22px";
        case 5:
            return "18px";
        case 6:
            return "15px";
        default:
            return "11px";
    }
}
function colorHexToRGB(color: string) {

    let r = parseInt(color.substring(1, 3), 16);
    let g = parseInt(color.substring(3, 5), 16);
    let b = parseInt(color.substring(5, 7), 16);
    return [r, g, b];
}

function getClampedColor(color: string) {
    var colorRgb = colorHexToRGB(color);
    return 'rgb(' + Math.min(colorRgb[0], 232) + "," + Math.min(colorRgb[1], 232) + "," + Math.min(colorRgb[2], 232) + ")";
}