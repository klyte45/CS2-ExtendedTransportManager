import { StationData, LineDetails, LineManagementService } from "#service/LineManagementService";
import translate from "#utility/translate";
import { UnitSystem, kilogramsTo, replaceArgs, metersTo, nameToString, DefaultPanelScreen, Cs2FormLine } from "@klyte45/euis-components";

type StopInfoProps = {
    currentStopSelected: StationData;
    lineDetails: LineDetails;
    measureUnit: UnitSystem;
    reloadData(x: boolean): void;
    onStopSelected(x: StationData): void;
};
export const LineDetail_StopInfo = ({ currentStopSelected: station, lineDetails, measureUnit, onStopSelected, reloadData }: StopInfoProps) => {
    if (!station) return null;

    async function setSelectedAsFirstStop() {
        const idx = lineDetails?.Stops.indexOf(station);
        const thisStop = lineDetails?.Stops[0];
        const nextStop = lineDetails?.Stops[idx];
        const refNextStopPos = nextStop.position < thisStop.position ? 1 + nextStop.position : nextStop.position;
        const totalDistanceSegments = lineDetails?.Segments.filter(x => x.end > thisStop.position && x.start < refNextStopPos);
        if (await LineManagementService.setFirstStop(lineDetails.LineData.entity, totalDistanceSegments.length)) {
            reloadData(true);
        } else {
            console.log("Failed setting first stop!")
        }
    }

    const isSimetric = LineManagementService.checkSimetry(lineDetails.Stops);
    const halfTripIdx = lineDetails.Stops.length / 2;
    const hasInverseStop = isSimetric && station.index != 0 && station.index != halfTripIdx;
    let inverseStop: StationData;
    if (hasInverseStop) {
        const delta = lineDetails.Stops.length - station.index;
        inverseStop = lineDetails.Stops[delta];
    }

    let passengerValueFmt: string;
    if (station.isCargo) {
        let val = kilogramsTo(station.cargo, measureUnit);
        passengerValueFmt = replaceArgs(engine.translate(val[0]), { ...val[1], SIGN: "" }).trim();
    } else {
        passengerValueFmt = station.cargo.toFixed();
    }
    let nextVehicleDistanceFmt: string;
    let stopsYetToPassText: string;
    if (station.arrivingVehicle) {
        let val = metersTo(station.arrivingVehicleDistance, measureUnit);
        nextVehicleDistanceFmt = replaceArgs(engine.translate(val[0]), { ...val[1], SIGN: "" }).trim();
        stopsYetToPassText = station.arrivingVehicle
            ? station.arrivingVehicleStops
                ? replaceArgs(translate("lineStationDetail.nextVehicleStopsRemaning"), { stops: station.arrivingVehicleStops.toFixed() })
                : translate("lineStationDetail.nextVehicleIncoming")
            : "";
    }
    const fullStationTitle = nameToString(station.name) + (
        isSimetric
            ? " " + replaceArgs(translate("lineStationDetail.platformDestinationFmt"), { stationName: nameToString(lineDetails.Stops[station.index < halfTripIdx ? halfTripIdx : 0]?.name) ?? "???" })
            : ""
    );
    return <>
        <DefaultPanelScreen title={fullStationTitle} size="h2" buttonsRowContent={<>
            {lineDetails?.Stops[0]?.entity.Index == station.entity.Index
                ? <button className="darkestBtn" disabled>{translate("lineStationDetail.alreadyFirstStop")}</button>
                : <button className="neutralBtn" onClick={() => setSelectedAsFirstStop()}>{translate("lineStationDetail.setAsFirstStop")}</button>}
            {station.parent?.Index
                ? <button className="neutralBtn" onClick={() => LineManagementService.selectEntity(station.parent)}>{translate("lineStationDetail.selectBuilding")}</button>
                : <button className="darkestBtn">{translate("lineStationDetail.notABuilding")}</button>}
            <button className="neutralBtn" onClick={() => LineManagementService.selectEntity(station.entity)}>{translate("lineStationDetail.selectStop")}</button>
            <button className="neutralBtn" onClick={() => LineManagementService.focusToEntity(station.entity)}>{translate("lineStationDetail.goToStop")}</button>
            {hasInverseStop
                ? <>
                    <div style={{ display: "flex", flexGrow: 5 }}></div>
                    <button className="neutralBtn" onClick={() => onStopSelected(inverseStop)}>{translate("lineStationDetail.seeInverseStop")}</button>
                </>
                : <></>}
        </>}>
            <Cs2FormLine title={translate(station.isCargo ? "lineStationDetail.cargoWaiting" : "lineStationDetail.passengerWaiting")}>{passengerValueFmt}</Cs2FormLine>
            <Cs2FormLine title={translate("lineStationDetail.nextVehicleInformation")}>{lineDetails.LineData.vehicles == 0
                ? <span style={{ "color": "var(--negativeColor)" }}>{translate("lineStationDetail.noNextVehicleData")}</span>
                :
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end", alignItems: "stretch" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-around", paddingRight: "5px" }}>
                        <div>{nameToString(station.arrivingVehicle.name)}</div>
                        <div>{nextVehicleDistanceFmt}</div>
                        <div>{stopsYetToPassText}</div>
                    </div>
                    <div>
                        <button className="neutralBtn" onClick={() => LineManagementService.focusToEntity(station.arrivingVehicle.entity)}>{translate("lineStationDetail.followVehicle")}</button>
                        <button className="neutralBtn" onClick={() => LineManagementService.selectEntity(station.arrivingVehicle.entity)}>{translate("lineStationDetail.viewDetailsGame")}</button>
                    </div>
                </div>}</Cs2FormLine>
            {/* <img src="coui://cctv.xtm.k45/" />*/}
        </DefaultPanelScreen>
    </>;
};
