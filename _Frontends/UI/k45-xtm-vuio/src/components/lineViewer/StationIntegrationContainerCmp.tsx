import { TransportType, TransportTypePriority } from "#enum/TransportType";
import { LineData, StationData, VehicleData } from "#service/LineManagementService";
import { ColorUtils, Entity, nameToString, toVanillaEntity } from "@klyte45/vuio-commons";
import { CSSProperties } from "react";
import { TlmLineFormatCmp } from "./TlmLineFormatCmp";
import { selectedInfo } from "cs2/bindings";
import { Tooltip } from "cs2/ui";

type Props = {
    station: StationData;
    getLineById: (e: number) => LineData;
    vehicles: VehicleData[];
    thisLineId: Entity;
    keyId: number;
    normalizedPosition: number;
    totalStationCount: number;
    isFaded?: boolean;
};

export function StationIntegrationContainerCmp({ station, getLineById, thisLineId, normalizedPosition, totalStationCount, isFaded }: Props) {
    const linesToIntegrate = [...station.connectedLines.reduce((p, n) => {
        if (thisLineId.Index != n.line.Index) p.add(n.line.Index);
        return p;
    }, new Set<number>())].map(x => getLineById(x))
        .sort((a, b) => (getPriority(a.type) - getPriority(b.type)) || (a.routeNumber - b.routeNumber));
    if (linesToIntegrate.length == 0) return null;
    const colors = [...linesToIntegrate.reduce((p, n) => {
        if (n) p.add(n.color);
        return p;
    }, new Set<string>())];
    const stepEachColor = 100 / colors.length;
    return <div className="stationIntegrationContainer" style={{ top: (100 * normalizedPosition) + "%", minHeight: (100 / totalStationCount) + "%" }}>
        <div className={["lineStation", isFaded && "faded"].join(" ")}>
            <div className="integrationLineCutted" style={colors.length == 1 || colors.length > 6 ? {
                "--integrationLineColor": ColorUtils.getClampedColor(colors.length > 6 ? "#444444" : colors[0])
            } as CSSProperties : {
                "--integrationBackgroundImage": `linear-gradient(to right, ${colors.flatMap((x, i) => {
                    const targetColor = ColorUtils.getClampedColor(x);
                    const margin = 3;
                    return [
                        `transparent ${i * stepEachColor}%`,
                        `transparent ${i * stepEachColor + margin}%`,
                        `${targetColor} ${i * stepEachColor + margin}%`,
                        `${targetColor} ${(i + 1) * stepEachColor - margin}%`,
                        `transparent ${(i + 1) * stepEachColor - margin}%`,
                        `transparent ${(i + 1) * stepEachColor}%`
                    ];
                }).join(", ")})`
            } as CSSProperties} />
            <div className="integrationStationBulletBG" />
            <div className="integrationStationBullet" />
            {<div className={`stationIntersectionsContainer ${linesToIntegrate.length > 4 ? "sz1" : ""}`}>
                {linesToIntegrate.map((lineData, i) => {
                    return <Tooltip key={i} tooltip={nameToString(lineData.name)}>
                        <div className="lineIntersection" onClick={() => selectedInfo.selectEntity(toVanillaEntity(lineData.entity))}>
                            <TlmLineFormatCmp {...lineData} text={lineData.xtmData?.Acronym || lineData.routeNumber.toFixed()} />
                        </div>
                    </Tooltip>;
                })}
            </div>}
        </div>
    </div>;
}

function getPriority(tt: TransportType): number {
    switch (tt) {
        case TransportType.Subway: return getPriority(TransportType.Train);
        default: return TransportTypePriority.indexOf(tt);
    }
}