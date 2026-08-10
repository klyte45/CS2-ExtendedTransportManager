import { toEntityTyped, toVanillaEntity, VanillaComponentResolver } from "@klyte45/vuio-commons";
import { Entity, Name, selectedInfo, time } from "cs2/bindings"
import { useEffect, useRef, useState } from "react";
import { TlmViewerCmp } from "./lineViewer/TlmViewerCmp";
import { LineData, LineDetails, LineManagementService, MapViewerOptions, StationData, VehicleData } from "#service/LineManagementService";
import { TransportType } from "#enum/TransportType";
import engine from "cohtml/cohtml";
import "#styles/TLM_LineDetail.scss";
import { enrichVehicleInfo, enrichStopInfo } from "#utility/lineViewerUtils";
import { useValue } from "cs2/api";

type Props = {
    children: React.ReactNode;
    args: VanillaLineInformation;
    isXtm: boolean;
    xtmOptions: MapViewerOptions;
};

const TypeToIcons = {
    [`${TransportType.Bus}.false`]: "assetdb://gameui/Media/Game/Icons/BusLine.svg",
    [`${TransportType.Tram}.false`]: "assetdb://gameui/Media/Game/Icons/TramLine.svg",
    [`${TransportType.Subway}.false`]: "assetdb://gameui/Media/Game/Icons/SubwayLine.svg",
    [`${TransportType.Train}.false`]: "assetdb://gameui/Media/Game/Icons/PassengerTrainLine.svg",
    [`${TransportType.Ship}.false`]: "assetdb://gameui/Media/Game/Icons/PassengerShipLine.svg",
    [`${TransportType.Ferry}.false`]: "assetdb://gameui/Media/Game/Icons/PassengerShipLine.svg",
    [`${TransportType.Airplane}.false`]: "assetdb://gameui/Media/Game/Icons/PassengerAirplaneLine.svg",
    [`${TransportType.Train}.true`]: "assetdb://gameui/Media/Game/Icons/CargoTrainLine.svg",
    [`${TransportType.Ship}.true`]: "assetdb://gameui/Media/Game/Icons/CargoShipLine.svg",
    [`${TransportType.Airplane}.true`]: "assetdb://gameui/Media/Game/Icons/CargoAirplaneLine.svg",
}


export const XtmLineViewer = ({ children, args, isXtm, xtmOptions }: Props) => {
    const [indexedLineList, setIndexedLineList] = useState<Record<string, LineData>>({});
    const [lineDetails, setLineDetails] = useState<LineDetails>();
    const [isLineSimetric, setIsLineSimetric] = useState(false);

    const reloadLines = async (res: LineData[]) => {
        const refOrder = Object.keys(TypeToIcons);
        const lineList = res.sort((a, b) => {
            const typeA = `${a.type}.${a.isCargo}`
            const typeB = `${b.type}.${b.isCargo}`

            if (typeA != typeB) return refOrder.indexOf(typeA) - refOrder.indexOf(typeB);
            return a.routeNumber - b.routeNumber
        });
        setIndexedLineList(lineList.reduce((p, n) => {
            p[n.entity.Index.toFixed(0)] = n;
            return p;
        }, {} as Record<string, LineData>));
    }

    async function reloadData(details: LineDetails) {
        if (details == null) return;
        details.Vehicles = details.Vehicles.map(x => {
            return {
                ...x,
                ...enrichVehicleInfo(x, details.Stops, details.LineData.length)
            }
        })
        details.Stops = details.Stops.map((x, i, arr) => {
            return {
                ...x,
                ...enrichStopInfo(i, x, arr, details.Vehicles, details.LineData)
            }
        })
        setLineDetails(details)
        setIsLineSimetric(LineManagementService.checkSimetry(details.Stops))

    }

    useEffect(() => {
        if (!isXtm) return;
        LineManagementService.listLines().then(reloadLines);
    }, [isXtm, useValue(selectedInfo.selectedRoute$)]);

    useEffect(() => {
        if (!isXtm) return;
        LineManagementService.getCurrentLineInfo().then(reloadData);
        return () => { };
    }, [useValue(selectedInfo.selectedEntity$), useValue(time.ticks$), isXtm])

    if (!isXtm || !lineDetails) {
        return <>{children}</>;
    }

    if (lineDetails) {
        return <TlmViewerCmp
            lineDetails={lineDetails}
            showDistances={xtmOptions.showDistances}
            showIntegrations={xtmOptions.showIntegrations}
            useHalfTripIfSimetric={xtmOptions.useHalfTripIfSimetric}
            showDistricts={xtmOptions.showDistricts}
            showVehicles={xtmOptions.showVehicles}
            useWhiteBackground={xtmOptions.useWhiteBackground}
            showPlatformCrowdness={xtmOptions.showPlatformCrowdness}
            getLineById={(x) => indexedLineList[x]}
            simetricLine={isLineSimetric}
        />
    }

    return <>Unsupported line type... Under development!</>
}


export interface VanillaLineInformation {
    width: number
    height: number
    stops: Stop[]
    focused: boolean
    group: string
    tooltipKeys: any[]
    tooltipTags: any[]
    color: Color
    vehicles: Vehicle[]
    segments: Segment[]
    stopCapacity: number
}

export interface Stop {
    entity: Entity
    name: Name
    position: number
    cargo: number
    capacity: number
    type: number
    isOutsideConnection: boolean
}


export interface Color {
    r: number
    g: number
    b: number
    a: number
}

export interface Vehicle {
    entity: Entity
    name: Name
    cargo: number
    capacity: number
    position: number
    type: number
}


export interface Segment {
    start: number
    end: number
    broken: boolean
}
