import { DistrictService } from "#service/DistrictService";
import { StationData } from "#service/LineManagementService";
import { CSSProperties, Component, ReactNode } from "react";


export class DistrictBorderContainerCmp extends Component<{
    stop: StationData;
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
                {!this.props.newOnly && (<div className={["oldDistrict", ...getExtraElementClassesForDistrict(station)].join(" ")}>{DistrictService.getEffectiveDistrictName(station)}</div>)}
                {!this.props.oldOnly && (<div className={["newDistrict", ...getExtraElementClassesForDistrict(station)].join(" ")}>{DistrictService.getEffectiveDistrictName(station)}</div>)}
            </div>
        </div>;
    }
}
function getExtraElementClassesForDistrict(station: StationData) {
    return (station.district.Index > 0 ? [""]
        : station.isOutsideConnection ? ["outsideConn"]
            : ["noDistrict"]);
}
