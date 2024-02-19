import { StationData, VehicleData } from "#service/LineManagementService";
import { MeasureUnit, kilogramsTo, metersTo, nameToString, replaceArgs } from "@klyte45/euis-components";
import translate from "#utility/translate"
import { Component, ReactNode } from "react";
import { Tooltip } from 'react-tooltip';


export class StationContainerCmp extends Component<{
    station: StationData;
    vehicles: VehicleData[];
    keyId: number;
    normalizedPosition: number;
    totalStationCount: number
    onSelectStop: (entity: StationData) => void
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
        const id = `linestation-${station.entity.Index}-${this.props.keyId}`
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

        return <Tooltip anchorSelect={`#${id}`} className="tlm-station-tooltip" >
            <div style={{ display: "block" }}>{station.parent.Index ? <div>{replaceArgs(translate("lineStationDetail.buildingLbl"), { building: nameToString(station.parentName) })}</div> : ""}
                <div style={{ display: "block" }}>{replaceArgs(translate(`lineStationDetail.waiting.${station.isCargo ? "cargo" : "passengers"}`), { quantity: passengerValueFmt })}</div>
                <div>{station.arrivingVehicle
                    ? <>{translate(`lineStationDetail.nextVehicleData`)} <b>{nameToString(station.arrivingVehicle.name) + " - " + station.arrivingVehicle.entity.Index}</b>
                        <div style={{ display: "inline", fontSize: "var(--fontSizeXS)" }}>↳<i> {nextVehicleDistanceFmt}&nbsp;-&nbsp;{stopsYetToPassText}</i></div></>
                    : <b className="lineView-warning">{translate(`lineStationDetail.noNextVehicleData`)}</b>}</div>
            </div>
        </Tooltip>;
    }

    stopClicked(station: StationData) {
        console.log(station);
        engine.call("k45::xtm.lineViewer.setCctvPosition", station.worldPosition.x, station.worldPosition.y, station.worldPosition.z, station.azimuth, 0, 20)
        this.props.onSelectStop(station);
    }

    render(): ReactNode {
        const station = this.props.station;
        const id = `linestation-${station.entity.Index}-${this.props.keyId}`
        return <div className="lineStationContainer" style={{ top: (100 * this.props.normalizedPosition) + "%", minHeight: (100 / this.props.totalStationCount) + "%" }}>
            <div className="lineStation row col-12 align-items-center">
                <div className="stationName">{nameToString(station.name)}</div>
                <div className="stationBullet" id={id} onClick={() => this.stopClicked(station)} />
                {this.generateTooltip()}
            </div>
        </div>;
    }
}
