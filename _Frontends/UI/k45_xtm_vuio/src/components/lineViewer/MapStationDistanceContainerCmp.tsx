import { Unit } from "#enum/Unit";
import { SegmentData, StationData } from "#service/LineManagementService";
import { replaceArgs } from "@klyte45/vuio-commons";
import engine from "cohtml/cohtml";
import { LocalizedNumber, UnitSystem, useLocalization } from "cs2/l10n";
import { CSSProperties, useEffect, useState } from "react";

type Props = {
    segments: SegmentData[];
    stop: StationData;
    nextStop: StationData;
    normalizedPosition: number;
};

export function MapStationDistanceContainerCmp({ segments, stop, nextStop, normalizedPosition }: Props) {
    const locale = useLocalization();
    const [measureUnit, setMeasureUnit] = useState<UnitSystem>(locale.unitSettings.unitSystem);

    useEffect(() => {
        const measureCallback = () => setMeasureUnit(useLocalization().unitSettings.unitSystem);
        engine.on("k45::xtm.common.onMeasureUnitsChanged", measureCallback);
        return () => engine.off("k45::xtm.common.onMeasureUnitsChanged", measureCallback);
    }, []);

    if (!isFinite(measureUnit)) return null;
    const refNextStopPos = nextStop.position < stop.position ? 1 + nextStop.position : nextStop.position;
    const totalDistanceSegments = segments.filter(x => x.end > stop.position && x.start < refNextStopPos);
    const nextVehicleDistanceFmt = LocalizedNumber.renderString(locale, {
        value: totalDistanceSegments.reduce((p, n) => p + n.sizeMeters, 0),
        unit: Unit.Length,
        signed: false
    });
    const topOffset: CSSProperties = { top: (100 * normalizedPosition) + "%" };
    let waypointsText = "";
    if (totalDistanceSegments.length > 1) {
        waypointsText = `(${totalDistanceSegments.length - 1}wp) - `;
    }

    return <div className="stationDistanceContainer" style={topOffset}>
        <div className="distanceLbl">{waypointsText + nextVehicleDistanceFmt}</div>
    </div>;
}
