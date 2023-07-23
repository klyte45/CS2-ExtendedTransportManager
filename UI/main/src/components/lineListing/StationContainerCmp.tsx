import { ColorUtils } from "#utility/ColorUtils";
import { Entity } from "#utility/Entity";
import { MeasureUnit, kilogramsTo, metersTo } from "#utility/MeasureUnitsUtils";
import { nameToString, replaceArgs } from "#utility/name.utils";
import translate from "#utility/translate";
import { CSSProperties, Component, ReactNode } from "react";
import { Tooltip } from 'react-tooltip';
import { StationData, VehicleData, getFontSizeForText } from "./LineDetailCmp";
import { LineData } from "./LineListCmp";


export class StationContainerCmp extends Component<{
    station: StationData;
    lineData: LineData;
    getLineById: (e: Entity) => LineData;
    vehicles: VehicleData[];
    setSelection: (e: Entity) => void;
    keyId: number;
    normalizedPosition: number;
    totalStationCount: number
}, { measureUnit?: MeasureUnit; }> {

    constructor(props) {
        super(props);
        this.state = {};
    }
    private measureCallback = async () => this.setState({ measureUnit: await engine.call("k45::xtm.common.getMeasureUnits") });
    componentDidMount() {
        engine.on("k45::xtm.common.onMeasureUnitsChanged", this.measureCallback);
        engine.call("k45::xtm.common.getMeasureUnits").then(async (x) => {
            this.setState({ measureUnit: x });
        });
    }
    override componentWillUnmount() {
        engine.off("k45::xtm.common.onMeasureUnitsChanged", this.measureCallback);
    }

    private generateTooltip() {
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

        return <>
            <div style={{ display: "block" }}>{station.parent.Index ? <div>{replaceArgs(translate("lineStationDetail.buildingLbl"), { building: nameToString(station.parentName) })}</div> : ""}
                <div style={{ display: "block" }}>{replaceArgs(translate(`lineStationDetail.waiting.${station.isCargo ? "cargo" : "passengers"}`), { quantity: passengerValueFmt })}</div>
                <div>{station.arrivingVehicle
                    ? <>{translate(`lineStationDetail.nextVehicleData`)} <b>{nameToString(station.arrivingVehicle.name) + " - " + station.arrivingVehicle.entity.Index}</b>
                        <div style={{ display: "inline", fontSize: "var(--fontSizeXS)" }}>↳<i> {nextVehicleDistanceFmt}&nbsp;-&nbsp;{stopsYetToPassText}</i></div></>
                    : <b className="lineView-warning">{translate(`lineStationDetail.noNextVehicleData`)}</b>}</div>
            </div>
        </>;
    }


    render(): ReactNode {
        const station = this.props.station;
        const lineCommonData = this.props.lineData;
        const id = `linestation-${station.entity.Index}-${this.props.keyId}`
        return <div className="lineStationContainer" style={{ top: (100 * this.props.normalizedPosition) + "%", minHeight: (100 / this.props.totalStationCount) + "%" }}>
            <div className="lineStation row col-12 align-items-center">
                <div className="stationName">{nameToString(station.name)}</div>
                <div className="stationBullet" id={id} >
                </div>
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

                <Tooltip anchorSelect={`#${id}`} className="tlm-station-tooltip" >
                    {this.generateTooltip()}
                </Tooltip>
            </div>
        </div>;
    }
}
