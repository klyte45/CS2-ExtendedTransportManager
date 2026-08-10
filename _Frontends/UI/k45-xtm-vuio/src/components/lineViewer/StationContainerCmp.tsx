import { StationData, VehicleData } from "#service/LineManagementService";
import translate from "#utility/translate";
import { nameToString, replaceArgs, toVanillaEntity, NameCustom, NameFormatted } from "@klyte45/vuio-commons";
import engine from "cohtml/cohtml";
import { LocalizedNumber, UnitSystem, useLocalization } from "cs2/l10n";
import React, { CSSProperties, useEffect, useState } from "react";
import { Tooltip } from "cs2/ui";
import { Unit } from "#enum/Unit";
import { camera, selectedInfo } from "cs2/bindings";
import { useValue } from "cs2/api";
import { getCrowdnessBorderStyle, getCrowdnessRatio } from "#utility/lineViewerUtils";

type Props = {
    station: StationData;
    vehicles: VehicleData[];
    keyId: number;
    normalizedPosition: number;
    totalStationCount: number;
    isFaded?: boolean;
    direction?: number;
    showPlatformCrowdness?: boolean;
    stopCapacity?: number;
    pairStop?: StationData;
    isSplitBullet?: boolean;
    outboundTerminusName?: NameCustom | NameFormatted;
    returnTerminusName?: NameCustom | NameFormatted;
};

export function StationContainerCmp({
    station,
    vehicles: _vehicles,
    keyId,
    normalizedPosition,
    totalStationCount,
    isFaded,
    direction,
    showPlatformCrowdness,
    stopCapacity = 0,
    pairStop,
    isSplitBullet,
    outboundTerminusName,
    returnTerminusName
}: Props) {
    const locale = useLocalization();
    const [measureUnit, setMeasureUnit] = useState<UnitSystem>(locale.unitSettings.unitSystem);
    const selectedEntity = useValue(selectedInfo.selectedEntity$);

    useEffect(() => {
        const measureCallback = () => setMeasureUnit(useLocalization().unitSettings.unitSystem);
        engine.on("k45::xtm.common.onMeasureUnitsChanged", measureCallback);
        return () => engine.off("k45::xtm.common.onMeasureUnitsChanged", measureCallback);
    }, []);

    const id = `linestation-${station.entity.Index}-${keyId}`;

    function formatWaiting(value: number, isCargo: boolean): React.ReactNode {
        return LocalizedNumber.renderString(locale, {
            value,
            unit: isCargo ? Unit.Weight : Unit.Integer,
            signed: false
        });
    }

    function formatCrowdnessLine(platform: StationData): React.ReactNode {
        const waitingFmt = formatWaiting(platform.cargo, platform.isCargo);
        const capacityFmt = LocalizedNumber.renderString(locale, {
            value: stopCapacity,
            unit: platform.isCargo ? Unit.Weight : Unit.Integer,
            signed: false
        });
        const percentFmt = LocalizedNumber.renderString(locale, {
            value: getCrowdnessRatio(platform.cargo, stopCapacity) * 100,
            unit: Unit.PercentageSingleFraction
        });
        return replaceArgs(translate("lineStationDetail.crowdness"), {
            waiting: waitingFmt,
            capacity: capacityFmt,
            percent: percentFmt
        });
    }

    function waitingLabel(platform: StationData): React.ReactNode {
        return replaceArgs(translate(`lineStationDetail.waiting.${platform.isCargo ? "cargo" : "passengers"}`), {
            quantity: formatWaiting(platform.cargo, platform.isCargo)
        });
    }

    function nextVehicleBlock(): React.ReactNode {
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

        return station.arrivingVehicle
            ? <>
                <div style={{ whiteSpace: "nowrap", overflowX: "hidden", overflowY: "hidden", display: "block", height: "20rem", textOverflow: "ellipsis" }}>
                    {translate(`lineStationDetail.nextVehicleData`).trim() + " " + nameToString(station.arrivingVehicle.name)}
                </div>
                <div style={{ display: "inline", fontSize: "var(--fontSizeXS)" }}>{"↳ " + nextVehicleDistanceFmt + " - " + stopsYetToPassText}</div>
            </>
            : <div className="lineView-warning">{translate(`lineStationDetail.noNextVehicleData`)}</div>;
    }

    function generateTooltip(children: React.ReactNode) {
        const showSplitTooltip = !!(isSplitBullet && pairStop);
        return <Tooltip alignment="end" direction="up" tooltip={
            <div style={{ display: "block" }}>
                {station.parent.Index ? <div>{replaceArgs(translate("lineStationDetail.buildingLbl"), { building: nameToString(station.parentName) })}</div> : ""}
                {showSplitTooltip ? <>
                    <div style={{ display: "block", marginTop: "4rem" }}>
                        <div style={{ fontWeight: "bold" }}>{outboundTerminusName ? nameToString(outboundTerminusName) : ""}</div>
                        <div style={{ display: "block" }}>{waitingLabel(station)}</div>
                        <div style={{ display: "block" }}>{formatCrowdnessLine(station)}</div>
                    </div>
                    <div style={{ display: "block", marginTop: "6rem" }}>
                        <div style={{ fontWeight: "bold" }}>{returnTerminusName ? nameToString(returnTerminusName) : ""}</div>
                        <div style={{ display: "block" }}>{waitingLabel(pairStop!)}</div>
                        <div style={{ display: "block" }}>{formatCrowdnessLine(pairStop!)}</div>
                    </div>
                </> : <>
                    <div style={{ display: "block" }}>{waitingLabel(station)}</div>
                    <div style={{ display: "block" }}>{formatCrowdnessLine(station)}</div>
                </>}
                {nextVehicleBlock()}
            </div>} className="tlm-station-tooltip">{children}</Tooltip>;
    }

    function fillStyle(platform: StationData, side?: "left" | "right"): CSSProperties {
        const border = getCrowdnessBorderStyle(getCrowdnessRatio(platform.cargo, stopCapacity));
        const width = border.borderWidthRem + "rem";
        const base = {
            "--stopFill": border.fillPercent + "%",
            borderTopColor: "black",
            borderRightColor: "black",
            borderBottomColor: "black",
            borderLeftColor: "black",
            borderTopStyle: "solid",
            borderRightStyle: "solid",
            borderBottomStyle: "solid",
            borderLeftStyle: "solid"
        } as CSSProperties;
        if (side === "left") {
            return {
                ...base,
                borderTopWidth: width,
                borderBottomWidth: width,
                borderLeftWidth: width,
                borderRightWidth: "2rem"
            };
        }
        if (side === "right") {
            return {
                ...base,
                borderTopWidth: width,
                borderBottomWidth: width,
                borderRightWidth: width,
                borderLeftWidth: "2rem"
            };
        }
        return {
            ...base,
            borderTopWidth: width,
            borderRightWidth: width,
            borderBottomWidth: width,
            borderLeftWidth: width
        };
    }

    function ringStyle(platform: StationData, side?: "left" | "right"): CSSProperties {
        const border = getCrowdnessBorderStyle(getCrowdnessRatio(platform.cargo, stopCapacity));
        const width = border.borderWidthRem + "rem";
        const color = border.borderColor;
        if (side === "left") {
            return {
                borderTopWidth: width,
                borderBottomWidth: width,
                borderLeftWidth: width,
                borderRightWidth: "2rem",
                borderTopColor: color,
                borderBottomColor: color,
                borderLeftColor: color,
                borderRightColor: "black",
                borderTopStyle: "solid",
                borderBottomStyle: "solid",
                borderLeftStyle: "solid",
                borderRightStyle: "solid"
            };
        }
        if (side === "right") {
            return {
                borderTopWidth: width,
                borderBottomWidth: width,
                borderRightWidth: width,
                borderLeftWidth: "2rem",
                borderTopColor: color,
                borderBottomColor: color,
                borderRightColor: color,
                borderLeftColor: "black",
                borderTopStyle: "solid",
                borderBottomStyle: "solid",
                borderLeftStyle: "solid",
                borderRightStyle: "solid"
            };
        }
        return {
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
        };
    }

    function renderHalf(side: "left" | "right", platform: StationData) {
        const pulse = getCrowdnessRatio(platform.cargo, stopCapacity) >= 0.75;
        return <div className={["stationBulletHalfWrap", side].join(" ")}>
            <div className="stationBulletHalfFill" style={fillStyle(platform, side)} />
            <div className={["stationBulletHalfRing", pulse && "crowdnessPulse"].join(" ")} style={ringStyle(platform, side)} />
        </div>;
    }

    function renderCrowdnessBullet() {
        if (isSplitBullet && pairStop) {
            return <div className={["stationBulletSplit", isFaded && "faded"].join(" ")} id={id}>
                {renderHalf("left", station)}
                {renderHalf("right", pairStop)}
            </div>;
        }

        const pulse = getCrowdnessRatio(station.cargo, stopCapacity) >= 0.75;
        return <div className={["stationBullet", "crowdness", isFaded && "faded"].join(" ")} id={id}>
            <div className="stationBulletFill" style={fillStyle(station)} />
            <div className={["stationBulletRing", pulse && "crowdnessPulse"].join(" ")} style={ringStyle(station)} />
        </div>;
    }

    function handleStopClick() {
        selectedInfo.selectEntity(toVanillaEntity(station.entity))
        camera.focusEntity(toVanillaEntity(station.entity))
    }

    return <div className={["lineStationContainer", [station.parent, station.entity].some(x => x.Index == selectedEntity.index) ? "xtm-selected" : ""].join(" ")} style={{ top: (100 * normalizedPosition) + "%", minHeight: (100 / totalStationCount) + "%" }}>
        <div className="lineStation row col-12 align-items-center" onClick={handleStopClick} >
            <div className={["stationName", isFaded && "faded"].join(" ")}>{nameToString(station.name)}</div>
            {generateTooltip(showPlatformCrowdness
                ? renderCrowdnessBullet()
                : <div className={["stationBullet", isFaded && "faded"].join(" ")} id={id} />
            )}
            {!isFaded && !!direction && <div className={["stationDirection", direction > 0 ? "down" : "up"].join(" ")} />}
        </div>
    </div>
}
