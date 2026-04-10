import { StationData, VehicleData } from "#service/LineManagementService";
import translate from "#utility/translate";
import { nameToString, replaceArgs } from "@klyte45/vuio-commons";
import engine from "cohtml/cohtml";
import { LocalizedNumber, UnitSystem, useCachedLocalization } from "cs2/l10n";
import React, { useEffect, useState } from "react";
import { Tooltip } from "cs2/ui";
import { Unit } from "cs2/bindings";

type Props = {
    station: StationData;
    vehicles: VehicleData[];
    keyId: number;
    normalizedPosition: number;
    totalStationCount: number;
    onSelectStop: (entity: StationData) => void;
    isFaded?: boolean;
    direction?: number;
};

export function StationContainerCmp({ station, vehicles: _vehicles, keyId, normalizedPosition, totalStationCount, onSelectStop, isFaded, direction }: Props) {
    const locale = useCachedLocalization();
    const [measureUnit, setMeasureUnit] = useState<UnitSystem>(locale.unitSettings.unitSystem);

    useEffect(() => {
        const measureCallback = () => setMeasureUnit(useCachedLocalization().unitSettings.unitSystem);
        engine.on("k45::xtm.common.onMeasureUnitsChanged", measureCallback);
        return () => engine.off("k45::xtm.common.onMeasureUnitsChanged", measureCallback);
    }, []);

    const id = `linestation-${station.entity.Index}-${keyId}`;

    function generateTooltip() {
        if (!isFinite(measureUnit)) return;
        let passengerValueFmt: React.ReactNode;
        if (station.isCargo) {
            passengerValueFmt = LocalizedNumber({
                value: station.cargo,
                unit: Unit.Weight,
                signed: false
            });
        } else {
            passengerValueFmt = LocalizedNumber({
                value: station.cargo,
                unit: Unit.Integer,
                signed: false
            });
        }
        let nextVehicleDistanceFmt: React.ReactNode | undefined;
        if (station.arrivingVehicle) {
            nextVehicleDistanceFmt = LocalizedNumber({
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

        return <Tooltip tooltip={
            <div style={{ display: "block" }}>
                {station.parent.Index ? <div>{replaceArgs(translate("lineStationDetail.buildingLbl"), { building: nameToString(station.parentName) })}</div> : ""}
                <div style={{ display: "block" }}>{replaceArgs(translate(`lineStationDetail.waiting.${station.isCargo ? "cargo" : "passengers"}`), { quantity: passengerValueFmt })}</div>
                <div>{station.arrivingVehicle
                    ? <>{translate(`lineStationDetail.nextVehicleData`)} <b>{nameToString(station.arrivingVehicle.name) + " - " + station.arrivingVehicle.entity.Index}</b>
                        <div style={{ display: "inline", fontSize: "var(--fontSizeXS)" }}>↳<i> {nextVehicleDistanceFmt} - {stopsYetToPassText}</i></div></>
                    : <b className="lineView-warning">{translate(`lineStationDetail.noNextVehicleData`)}</b>}
                </div>
            </div>} className="tlm-station-tooltip" />;
    }

    function handleStopClick() {
        engine.call("k45::xtm.lineViewer.setCctvPosition", station.worldPosition.x, station.worldPosition.y, station.worldPosition.z, station.azimuth, 0, 20);
        onSelectStop(station);
    }

    return <div className="lineStationContainer" style={{ top: (100 * normalizedPosition) + "%", minHeight: (100 / totalStationCount) + "%" }}>
        <div className="lineStation row col-12 align-items-center">
            <div className={["stationName", isFaded && "faded"].join(" ")}>{nameToString(station.name)}</div>
            <div className={["stationBullet", isFaded && "faded"].join(" ")} id={id} onClick={handleStopClick} />
            {!isFaded && !!direction && <div className={["stationDirection", direction > 0 ? "down" : "up"].join(" ")} />}
            {generateTooltip()}
        </div>
    </div>;
}
