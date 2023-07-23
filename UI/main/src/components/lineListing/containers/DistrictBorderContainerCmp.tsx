import { MeasureUnit } from "#utility/MeasureUnitsUtils";
import { nameToString } from "#utility/name.utils";
import translate from "#utility/translate";
import { CSSProperties, Component, ReactNode } from "react";
import { StationData, VehicleData } from "../LineDetailCmp";
import { LineData } from "../LineListCmp";


export class DistrictBorderContainerCmp extends Component<{
    stop: StationData;
    nextStop: StationData;
    normalizedPosition: number;
    totalStationCount: number
    newOnly?: boolean
    oldOnly?: boolean
}> {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render(): ReactNode {
        const station = this.props.stop;
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
