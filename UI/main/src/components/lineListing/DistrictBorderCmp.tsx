import { ColorUtils } from "#utility/ColorUtils";
import { Entity } from "#utility/Entity";
import { MeasureUnit, kilogramsTo, metersTo } from "#utility/MeasureUnitsUtils";
import { nameToString, replaceArgs } from "#utility/name.utils";
import translate from "#utility/translate";
import { CSSProperties, Component, ReactNode } from "react";
import { Tooltip } from 'react-tooltip';
import { StationData, VehicleData, getFontSizeForText } from "./LineDetailCmp";
import { LineData } from "./LineListCmp";


export class DistrictBorderCmp extends Component<{
    station: StationData;
    lineData: LineData;
    nextStop: StationData;
    vehicles: VehicleData[];
    normalizedPosition: number;
    totalStationCount: number
    newOnly?: boolean
    oldOnly?: boolean
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

    render(): ReactNode {
        const station = this.props.station;
        const nextStop = this.props.nextStop;
        let topOffset: CSSProperties;
        if (this.props.normalizedPosition <= 0) {
            topOffset = { top: "0", transform: "translateY(-20px)", height: (100 / this.props.totalStationCount) + "%" }
        } else if (this.props.normalizedPosition > 1) {
            topOffset = { bottom: "0", transform: "translateY(20px}", height: 0 }
        } else {
            topOffset = { top: (100 * this.props.normalizedPosition) + "%", height: (100 / this.props.totalStationCount) + "%" }
        }
        return <div className="districtLimitsContainer" style={topOffset}>
            <div className="districtDiv">
                <div className="before"></div>
                {!this.props.newOnly && (station.district.Index > 0 ? <div className="oldDistrict">{nameToString(station.districtName)}</div>
                    : station.isOutsideConnection ? <div className="oldDistrict outsideConn">{"Colossal Nation: " + nameToString(station.name)}</div>
                        : <div className="oldDistrict noDistrict">{translate("lineMap.noDistrict")}</div>)}
                {!this.props.oldOnly && (nextStop.district.Index > 0 ? <div className="newDistrict">{nameToString(nextStop.districtName)}</div>
                    : nextStop.isOutsideConnection ? <div className="newDistrict outsideConn">{"Colossal Nation: " + nameToString(nextStop.name)}</div>
                        : <div className="newDistrict noDistrict">{translate("lineMap.noDistrict")}</div>)}
            </div>
        </div>;
    }
}
