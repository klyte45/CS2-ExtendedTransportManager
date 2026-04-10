import { Unit } from "#enum/Unit";
import { VehicleData } from "#service/LineManagementService";
import { nameToString, toVanillaEntity } from "@klyte45/vuio-commons";
import { camera, selectedInfo } from "cs2/bindings";
import { LocalizedNumber, useLocalization } from "cs2/l10n";
import { Tooltip } from "cs2/ui";
import { CSSProperties } from "react";

type Props = {
    vehicle: VehicleData;
    isFaded: boolean;
};

export function MapVehicleContainerCmp({ vehicle, isFaded }: Props) {
    return <Tooltip tooltip={`${vehicle.cargo} / ${vehicle.capacity} (${LocalizedNumber.renderString(useLocalization(), {
        value: vehicle.cargo / vehicle.capacity * 100,
        unit: Unit.PercentageSingleFraction
    })})`}>
        <div className={["vehicleContainer", [vehicle.entity].some(x => x.Index == selectedInfo.selectedEntity$.value.index) ? "selected" : ""].join(" ")} style={{ top: (vehicle.normalizedPosition * 100) + "%", "--vehicleColor": "gray", "--vehicleFill": (vehicle.cargo / vehicle.capacity * 100) + "%", opacity: isFaded ? 0.5 : 1 } as CSSProperties}
            onClick={() => {
                selectedInfo.selectEntity(toVanillaEntity(vehicle.entity))
                camera.focusEntity(toVanillaEntity(vehicle.entity))
            }}>
            <div className="vehicleNeedle"><div className="painting" /></div>
            <div className="vehicle" style={{ zIndex: Math.floor(vehicle.normalizedPosition * 100) + 2000 } as CSSProperties}>
                {nameToString(vehicle.name) + " " + vehicle.entity.Index}
            </div>
        </div>
    </Tooltip >;
}
