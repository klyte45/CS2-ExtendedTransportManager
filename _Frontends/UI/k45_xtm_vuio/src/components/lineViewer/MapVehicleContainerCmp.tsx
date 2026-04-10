import { VehicleData } from "#service/LineManagementService";
import { nameToString } from "@klyte45/vuio-commons";
import { CSSProperties } from "react";

type Props = {
    vehicle: VehicleData;
};

export function MapVehicleContainerCmp({ vehicle }: Props) {
    return <div className="vehicleContainer" style={{ top: (vehicle.normalizedPosition * 100) + "%", "--vehicleColor": "gray" } as CSSProperties}>
        <div className="vehicle" style={{ zIndex: (vehicle.normalizedPosition * 100) + 2000 } as CSSProperties}>
            <div className="vehicleNeedle"><div className="painting" /></div>
            <div className="vehicleName">{nameToString(vehicle.name) + " " + vehicle.entity.Index}</div>
            <div className="vehicleFill">{(vehicle.cargo / vehicle.capacity * 100).toFixed() + "%"}</div>
        </div>
    </div>;
}
