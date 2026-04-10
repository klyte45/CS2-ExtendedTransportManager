import { DistrictService } from "#service/DistrictService";
import { StationData } from "#service/LineManagementService";
import { CSSProperties } from "react";

type Props = {
    stop: StationData;
    nextStop: StationData;
    normalizedPosition: number;
    totalStationCount: number;
    newOnly?: boolean;
    oldOnly?: boolean;
};

export function DistrictBorderContainerCmp({ stop, nextStop, normalizedPosition, totalStationCount, newOnly, oldOnly }: Props) {
    let topOffset: CSSProperties;
    if (normalizedPosition <= 0) {
        topOffset = { top: "0", transform: "translateY(-20rem)", height: (100 / totalStationCount) + "%" };
    } else if (normalizedPosition > 1) {
        topOffset = { bottom: "0", transform: "translateY(20rem)", height: 0 };
    } else {
        topOffset = { top: (100 * normalizedPosition) + "%", height: (100 / totalStationCount) + "%" };
    }
    return <div className="districtLimitsContainer" style={topOffset}>
        <div className="districtDiv">
            <div className="before"></div>
            {!newOnly && (<div className={["oldDistrict", ...getExtraElementClassesForDistrict(stop)].join(" ")}>{DistrictService.getEffectiveDistrictName(stop)}</div>)}
            {!oldOnly && (<div className={["newDistrict", ...getExtraElementClassesForDistrict(nextStop)].join(" ")}>{DistrictService.getEffectiveDistrictName(nextStop)}</div>)}
        </div>
    </div>;
}

function getExtraElementClassesForDistrict(station: StationData) {
    return (station.district.Index > 0 ? [""]
        : station.isOutsideConnection ? ["outsideConn"]
            : ["noDistrict"]);
}
