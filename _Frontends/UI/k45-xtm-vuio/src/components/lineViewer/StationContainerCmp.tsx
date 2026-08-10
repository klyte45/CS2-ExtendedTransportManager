import { StationData, VehicleData } from "#service/LineManagementService";
import translate from "#utility/translate";
import { nameToString, replaceArgs, toVanillaEntity } from "@klyte45/vuio-commons";
import engine from "cohtml/cohtml";
import { LocalizedNumber, UnitSystem, useLocalization } from "cs2/l10n";
import React, { useEffect, useState } from "react";
import { Tooltip } from "cs2/ui";
import { Unit } from "#enum/Unit";
import { camera, selectedInfo } from "cs2/bindings";
import { useValue } from "cs2/api";

type Props = {
    station: StationData;
    vehicles: VehicleData[];
    keyId: number;
    normalizedPosition: number;
    totalStationCount: number;
    isFaded?: boolean;
    direction?: number;
};

export function StationContainerCmp({ station, vehicles: _vehicles, keyId, normalizedPosition, totalStationCount, isFaded, direction }: Props) {
    const locale = useLocalization();
    const [measureUnit, setMeasureUnit] = useState<UnitSystem>(locale.unitSettings.unitSystem);
    const selectedEntity = useValue(selectedInfo.selectedEntity$);

    useEffect(() => {
        const measureCallback = () => setMeasureUnit(useLocalization().unitSettings.unitSystem);
        engine.on("k45::xtm.common.onMeasureUnitsChanged", measureCallback);
        return () => engine.off("k45::xtm.common.onMeasureUnitsChanged", measureCallback);
    }, []);

    const id = `linestation-${station.entity.Index}-${keyId}`;

    function generateTooltip(children: React.ReactNode) {
        let passengerValueFmt: React.ReactNode;
        if (station.isCargo) {
            passengerValueFmt = LocalizedNumber.renderString(locale, {
                value: station.cargo,
                unit: Unit.Weight,
                signed: false
            });
        } else {
            passengerValueFmt = LocalizedNumber.renderString(locale, {
                value: station.cargo,
                unit: Unit.Integer,
                signed: false
            });
        }
        let nextVehicleDistanceFmt: React.ReactNode | undefined;
        if (station.arrivingVehicle) {
            nextVehicleDistanceFmt = LocalizedNumber.renderString(locale, {
                value: station.arrivingVehicleDistance!,
                unit: Unit.Length,
                signed: false
            });
        }
        const stopsYetToPassText = station.arrivingVehicle
            ? station.arrivingVehicleStops
                ? replaceArgs(translate("lineStationDetail.nextVehicleStopsRemaning"), { stops: station.arrivingVehicleStops.toFixed() })
                : translate("lineStationDetail.nextVehicleIncoming")
            : "";

        return <Tooltip alignment="end" direction="up" tooltip={
            <div style={{ display: "block" }}>
                {station.parent.Index ? <div>{replaceArgs(translate("lineStationDetail.buildingLbl"), { building: nameToString(station.parentName) })}</div> : ""}
                <div style={{ display: "block" }}>{replaceArgs(translate(`lineStationDetail.waiting.${station.isCargo ? "cargo" : "passengers"}`), { quantity: passengerValueFmt })}</div>
                {station.arrivingVehicle
                    ? <><div style={{ whiteSpace: "nowrap", overflowX: "hidden", overflowY: "hidden", display: "block", height: "20rem", textOverflow: "ellipsis", }}>{
                        translate(`lineStationDetail.nextVehicleData`).trim() + " " + nameToString(station.arrivingVehicle.name)
                    }</div>
                        <div style={{ display: "inline", fontSize: "var(--fontSizeXS)" }}>{"↳ " + nextVehicleDistanceFmt + " - " + stopsYetToPassText}</div></>
                    : <div className="lineView-warning">{translate(`lineStationDetail.noNextVehicleData`)}</div>}

            </div>} className="tlm-station-tooltip" >{children}</Tooltip>;
    }

    function handleStopClick() {
        selectedInfo.selectEntity(toVanillaEntity(station.entity))
        camera.focusEntity(toVanillaEntity(station.entity))
    }

    return <div className={["lineStationContainer", [station.parent, station.entity].some(x => x.Index == selectedEntity.index) ? "xtm-selected" : ""].join(" ")} style={{ top: (100 * normalizedPosition) + "%", minHeight: (100 / totalStationCount) + "%" }}>
        <div className="lineStation row col-12 align-items-center" onClick={handleStopClick} >
            <div className={["stationName", isFaded && "faded"].join(" ")}>{nameToString(station.name)}</div>
            {generateTooltip(<div className={["stationBullet", isFaded && "faded"].join(" ")} id={id} />)}
            {!isFaded && !!direction && <div className={["stationDirection", direction > 0 ? "down" : "up"].join(" ")} />}
        </div>
    </div>
}
