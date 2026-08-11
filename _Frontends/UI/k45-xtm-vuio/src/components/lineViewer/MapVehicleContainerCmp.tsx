import { Unit } from "#enum/Unit";
import { VehicleData } from "#service/LineManagementService";
import { getCrowdnessBorderStyle, getCrowdnessRatio } from "#utility/lineViewerUtils";
import { nameToString, toVanillaEntity } from "@klyte45/vuio-commons";
import { useValue } from "cs2/api";
import { camera, selectedInfo } from "cs2/bindings";
import { LocalizedNumber, useLocalization } from "cs2/l10n";
import { Tooltip } from "cs2/ui";
import { CSSProperties } from "react";

type Props = {
    vehicle: VehicleData;
    isFaded: boolean;
};

export function MapVehicleContainerCmp({ vehicle, isFaded }: Props) {
    const selectedEntity = useValue(selectedInfo.selectedEntity$);
    const ratio = getCrowdnessRatio(vehicle.cargo, vehicle.capacity);
    const border = getCrowdnessBorderStyle(ratio);
    const width = border.borderWidthRem + "rem";
    const color = border.borderColor;

    const fillStyle = {
        "--vehicleColor": "gray",
        "--vehicleFill": border.fillPercent + "%",
        borderTopWidth: width,
        borderRightWidth: width,
        borderBottomWidth: width,
        borderLeftWidth: width,
        borderTopColor: "black",
        borderRightColor: "black",
        borderBottomColor: "black",
        borderLeftColor: "black",
        borderTopStyle: "solid",
        borderRightStyle: "solid",
        borderBottomStyle: "solid",
        borderLeftStyle: "solid"
    } as CSSProperties;

    const ringStyle = {
        borderTopWidth: width,
        borderRightWidth: width,
        borderBottomWidth: width,
        borderLeftWidth: width,
        borderTopColor: color,
        borderRightColor: color,
        borderBottomColor: color,
        borderLeftColor: color,
        borderTopStyle: "solid",
        borderRightStyle: "solid",
        borderBottomStyle: "solid",
        borderLeftStyle: "solid"
    } as CSSProperties;

    return <Tooltip tooltip={`${vehicle.cargo} / ${vehicle.capacity} (${LocalizedNumber.renderString(useLocalization(), {
        value: ratio * 100,
        unit: Unit.PercentageSingleFraction
    })})`}>
        <div className={["vehicleContainer", [vehicle.entity].some(x => x.Index == selectedEntity.index) ? "xtm-selected" : ""].join(" ")} style={{ top: (vehicle.normalizedPosition * 100) + "%", "--vehicleColor": "gray", opacity: isFaded ? 0.5 : 1, zIndex: Math.floor(vehicle.normalizedPosition * 100) + 2000 } as CSSProperties}
            onClick={() => {
                selectedInfo.selectEntity(toVanillaEntity(vehicle.entity))
                camera.focusEntity(toVanillaEntity(vehicle.entity))
            }}>
            <div className="vehicleNeedle"><div className="painting" /></div>
            <div className="vehicleShell">
                <div className="vehicle" style={fillStyle}>
                    {nameToString(vehicle.name) + " " + vehicle.entity.Index}
                </div>
                <div className={["vehicleRing", border.pulse && "crowdnessPulse"].join(" ")} style={ringStyle} />
            </div>
        </div>
    </Tooltip >;
}
