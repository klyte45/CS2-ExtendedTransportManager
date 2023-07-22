import { ColorUtils } from "#utility/ColorUtils";
import { Entity } from "#utility/Entity";
import { MeasureUnit, kilogramsTo, metersTo } from "#utility/MeasureUnitsUtils";
import { nameToString, replaceArgs } from "#utility/name.utils";
import renderToString from "#utility/renderToString";
import translate from "#utility/translate";
import { CSSProperties, Component, ReactNode } from "react";
import { LineData } from "./LineListCmp";
import { StationData, VehicleData, getFontSizeForText } from "./LineDetailCmp";

export class StationContainerCmp extends Component<{
    station: StationData;
    lineData: LineData;
    getLineById: (e: Entity) => LineData;
    nextStop?: StationData;
    vehicles: VehicleData[];
    setSelection: (e: Entity) => void;
}, { measureUnit?: MeasureUnit; }> {

    private tooltipContent?: string;
    private _tooltipDirty: boolean = false;
    constructor(props) {
        super(props);
        this.state = {};
    }
    private measureCallback = async () => this.setState({ measureUnit: await engine.call("k45::xtm.common.getMeasureUnits") }, () => this.componentDidUpdate());
    componentDidMount() {
        engine.on("k45::xtm.common.onMeasureUnitsChanged", this.measureCallback);
        engine.call("k45::xtm.common.getMeasureUnits").then(async (x) => {
            this.setState({ measureUnit: x }, () => this.componentDidUpdate());
        });
    }
    override componentWillUnmount() {
        engine.off("k45::xtm.common.onMeasureUnitsChanged", this.measureCallback);
    }

    private async generateTooltip() {
        if (!isFinite(this.state.measureUnit)) return;
        const station = this.props.station;
        let passengerValueFmt: string;
        if (station.isCargo) {
            let val = kilogramsTo(station.cargo, this.state.measureUnit);
            passengerValueFmt = replaceArgs(engine.translate(val[0]), { ...val[1], SIGN: "" }).trim();
        } else {
            passengerValueFmt = station.cargo.toFixed();
        }

        let nextVehicleDistanceFmt: string;
        if (station.arrivingVehicle) {
            let val = metersTo(station.arrivingVehicleDistance, this.state.measureUnit);
            nextVehicleDistanceFmt = replaceArgs(engine.translate(val[0]), { ...val[1], SIGN: "" }).trim();
        }
        const stopsYetToPassText = station.arrivingVehicle
            ? station.arrivingVehicleStops
                ? replaceArgs(translate("lineStationDetail.nextVehicleStopsRemaning"), { stops: station.arrivingVehicleStops.toFixed() })
                : translate("lineStationDetail.nextVehicleIncoming")
            : "";

        const newContent = await renderToString(<>
            <div style={{ display: "block" }}>{station.parent.Index ? <div>{replaceArgs(translate("lineStationDetail.buildingLbl"), { building: nameToString(station.parentName) })}</div> : ""}
                <div style={{ display: "block" }}>{replaceArgs(translate(`lineStationDetail.waiting.${station.isCargo ? "cargo" : "passengers"}`), { quantity: passengerValueFmt })}</div>
                <div>{station.arrivingVehicle
                    ? <>{translate(`lineStationDetail.nextVehicleData`)} <b>{nameToString(station.arrivingVehicle.name)}</b> ({nextVehicleDistanceFmt} - {stopsYetToPassText})</>
                    : <b className="lineView-warning">{translate(`lineStationDetail.noNextVehicleData`)}</b>}</div>
            </div>
        </>);
        this._tooltipDirty = this.tooltipContent == newContent;
    }

    override componentDidUpdate() {
        this.generateTooltip().then(() => this._tooltipDirty = !(this._tooltipDirty ? this.setState({}) as any : null) && false);
    }

    render(): ReactNode {
        const station = this.props.station;
        const lineCommonData = this.props.lineData;
        const nextStop = this.props.nextStop;

        return <div className="lineStationContainer">
            <div className="lineStation row col-12 align-items-center"
                data-tooltip={this.tooltipContent}
                data-tooltip-position="center middle"
                data-tooltip-pivot="left middle"
                data-tooltip-distanceX="30">
                <div className="stationName">{nameToString(station.name)}</div>
                <div className="stationBullet"></div>
                <div className="stationIntersections lineStation row align-items-center">
                    {([] as any[]).map((lineId: Entity) => {
                        if (lineId.Index == lineCommonData.entity.Index) return;
                        const otherLine = this.props.getLineById(lineId);
                        return <div className="lineIntersection">
                            <div className="formatContainer" title={nameToString(otherLine.name)} style={{ "--scaleFormat": 0.4 } as CSSProperties} onClick={() => this.props.setSelection(lineId)}>
                                <div className={`format ${otherLine.type} v????`} style={{ "--currentBgColor": otherLine.color } as CSSProperties}>
                                    <div className="before"></div>
                                    <div className="after"></div>
                                </div>
                                <div style={{ fontSize: getFontSizeForText(otherLine.xtmData?.Acronym || otherLine.routeNumber.toFixed()), color: ColorUtils.toRGBA(ColorUtils.getContrastColorFor(ColorUtils.toColor01(otherLine.color))) }} className="num">
                                    {otherLine.xtmData?.Acronym || otherLine.routeNumber.toFixed()}
                                </div>
                            </div>
                        </div>;
                    })}
                </div>
            </div>
            {nextStop && nextStop.district.Index != station.district.Index &&
                <div className="districtDiv lineStation row col-12 align-items-center">
                    <div className="before"></div>
                    {station.district.Index > 0 && <div className="oldDistrict">{nameToString(station.districtName)}</div>}
                    {nextStop.district.Index > 0 && <div className="newDistrict">{nameToString(nextStop.districtName)}</div>}
                </div>}
        </div>;
    }
}
