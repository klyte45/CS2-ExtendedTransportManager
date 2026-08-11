import icon1 from "#images/icon1.svg";
import iconWhite from "#images/iconWhite.svg";
import { OccupancyTimeChart } from "#components/charts/OccupancyTimeChart";
import { Unit as XtmUnit } from "#enum/Unit";
import { LineDetails, LineManagementService } from "#service/LineManagementService";
import { WEIntegrationService } from "#service/WEIntegrationService";
import { enrichStopInfo, enrichVehicleInfo, getLineHistoricalUsageDayAverage, getLineHistoricalUsageSeries } from "#utility/lineViewerUtils";
import translate from "#utility/translate";
import { durationToGameMinutes, Entity, nameToString, replaceArgs, toEntityTyped, toVanillaEntity, VanillaComponentResolver, VanillaWidgets } from "@klyte45/vuio-commons";
import { useValue } from "cs2/api";
import { camera, selectedInfo, time } from "cs2/bindings";
import { FocusDisabled } from "cs2/input";
import { LocalizedNumber, Unit, useLocalization } from "cs2/l10n";
import { Portal } from "cs2/ui";
import { useEffect, useMemo, useState } from "react";
import { LineDetail_WriteEverywhere } from "./WE_BlindEditor/LineDetail_WriteEverywhere";

/** Survives SIP remounts when switching lines / leaving and returning to line selection. */
let persistedHistoricalOccupancyExpanded = false;

export const XtmInfoSection = () => {
    const [lineDetails, setLineDetails] = useState<LineDetails>();
    const [weAvailable, setWeAvailable] = useState(false);
    const [weWindowShow, setWeWindowShow] = useState(false);
    const [lineNumber, setLineNumber] = useState(0);
    const [lineAcronym, setLineAcronym] = useState("");
    const localization = useLocalization();
    const selectedEntity = useValue(selectedInfo.selectedEntity$);
    const selectedRoute = useValue(selectedInfo.selectedRoute$);
    const editorModule = VanillaWidgets.instance.editorItemModule;

    const historicalSeries = useMemo(
        () => getLineHistoricalUsageSeries(lineDetails?.Stops ?? []),
        [lineDetails?.Stops],
    );
    const historicalDayAverage = useMemo(
        () => getLineHistoricalUsageDayAverage(lineDetails?.Stops ?? []),
        [lineDetails?.Stops],
    );

    useEffect(() => {
        LineManagementService.getCurrentLineInfo().then(reloadData);
        WEIntegrationService.isAvailable().then(setWeAvailable);
        LineManagementService.getRouteNumber(toEntityTyped(selectedEntity)).then(setLineNumber);
        LineManagementService.getRouteAcronym(toEntityTyped(selectedEntity)).then(setLineAcronym);
    }, [selectedEntity, useValue(time.ticks$)]);

    async function reloadData(details: LineDetails) {
        if(details == null) return;
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

    }
    if (!lineDetails) return <>Unsupported line type... Under development!</>;
    if (selectedEntity?.index == selectedRoute?.index) {

        const nextVehicleToMaintain = lineDetails.Vehicles.filter(x => x.maintenanceRange > 0).sort((b, a) => (a.odometer - a.maintenanceRange) - (b.odometer - b.maintenanceRange))[0];

        const maintenanceData = nextVehicleToMaintain ? <div style={{ width: "100%" }}>
            <VanillaComponentResolver.instance.InfoLink onSelect={() => focusAndSelect(nextVehicleToMaintain.entity)} >{nameToString(nextVehicleToMaintain.name)}</VanillaComponentResolver.instance.InfoLink>
            <div>{replaceArgs(translate("lineViewer.dataNextMaintenanceValueFmt"), { distance: LocalizedNumber.renderString(localization, { value: nextVehicleToMaintain.maintenanceRange - nextVehicleToMaintain.odometer, unit: Unit.Length }) })}</div>
        </div> : translate("lineViewer.dataNoNextMaintenance");

        const averageValue = LocalizedNumber.renderString(localization, {
            value: historicalDayAverage * 100,
            unit: XtmUnit.PercentageSingleFraction,
            signed: false,
        });
        const averageText = replaceArgs(
            translate("lineViewer.occupancyDayAverage", "Average occupancy through day: {value}"),
            { value: averageValue },
        );

        return <>{VanillaComponentResolver.CreateInfoSection([
            {
                left: translate("lineViewer.lineData"), uppercase: true, icon: iconWhite, right: <FocusDisabled>
                    {weAvailable && <VanillaComponentResolver.instance.ToolButton onSelect={() => setWeWindowShow(!weWindowShow)} selected={weWindowShow} src="coui://we.k45/UI/images/WE-White.svg" tooltip={translate("weIntegrationBlinds.title")} />}
                </FocusDisabled>
            },
            {
                left: translate("lineViewerEditor.internalNumber"), right: <VanillaComponentResolver.instance.IntInput value={lineNumber} className={editorModule.input}
                    onChange={setLineNumber}
                    onBlur={() => { LineManagementService.setRouteNumber(toEntityTyped(selectedEntity), lineNumber); selectedInfo.clearSelection(); setTimeout(() => selectedInfo.selectEntity(selectedEntity), 300) }} />
            },
            {
                left: translate("lineViewerEditor.displayIdentifier"), right: <VanillaWidgets.instance.StringInputField
                    className={editorModule.input}
                    value={lineAcronym} onChange={setLineAcronym}
                    onChangeEnd={() => { LineManagementService.setRouteAcronym(toEntityTyped(selectedEntity), lineAcronym); selectedInfo.clearSelection(); setTimeout(() => selectedInfo.selectEntity(selectedEntity), 300) }}
                />
            },
            { left: translate(lineDetails?.LineData.isCargo ? "lineViewer.dataTotalCargoWaiting" : "lineViewer.dataTotalPassengersWaiting"), right: <>{LocalizedNumber.renderString(localization, { value: lineDetails.Stops.reduce((p, n) => p + n.cargo, 0), unit: lineDetails.LineData.isCargo ? Unit.Weight : Unit.Integer })}</> },
            { left: translate(lineDetails?.LineData.isCargo ? "lineViewer.dataTotalCargoLoaded" : "lineViewer.dataTotalPassengersLoaded"), right: <>{LocalizedNumber.renderString(localization, { value: lineDetails.Vehicles.reduce((p, n) => p + n.cargo, 0), unit: lineDetails.LineData.isCargo ? Unit.Weight : Unit.Integer })}</> },
            { left: translate("lineViewer.dataLineFullLapAverageTime"), right: <>{replaceArgs(translate("lineViewer.formatMinutes"), { minutes: durationToGameMinutes(lineDetails.Segments.reduce((p, n) => p + n.duration, 0) * Math.PI + lineDetails.Stops.length * 4).toFixed() })}</> },
            { left: translate("lineViewer.dataNextVehicleToBeMaintained"), right: maintenanceData },
            { left: translate("lineViewer.dataAverageVehicleOccupance"), right: <>{LocalizedNumber.renderString(localization, { value: lineDetails.Vehicles.reduce((p, n) => p + n.cargo / n.capacity, 0) / lineDetails.Vehicles.length * 100, unit: Unit.Percentage })}</> },
            { left: translate("lineViewer.dataAverageStopWaiting"), right: <>{LocalizedNumber.renderString(localization, { value: lineDetails.Stops.reduce((p, n) => p + n.cargo / lineDetails.StopCapacity, 0) / lineDetails.Stops.length * 100, unit: Unit.Percentage })}</> },

        ])}
            <VanillaComponentResolver.instance.InfoSectionFoldout
                header={translate("lineViewer.lineHistoricalOccupancy", "Historical occupancy")}
                initialExpanded={persistedHistoricalOccupancyExpanded}
                onToggleExpanded={(expanded) => { persistedHistoricalOccupancyExpanded = expanded; }}
                disableFocus
            >
                <OccupancyTimeChart data={historicalSeries} color={lineDetails.LineData.color} />
                <div>{averageText}</div>
            </VanillaComponentResolver.instance.InfoSectionFoldout>
            <Portal>
                {weWindowShow && <LineDetail_WriteEverywhere lineId={lineDetails?.LineData.entity} stops={lineDetails.Stops} />}
            </Portal>
        </>;
    }
    const stopData = lineDetails?.Stops.find(x => x.entity.Index == selectedEntity?.index);
    if (stopData) {
        const inverseStop = lineDetails?.Stops.find(x => x.parent.Index == stopData.parent.Index && x.entity.Index != stopData.entity.Index);
        const thisIdx = lineDetails?.Stops.findIndex(x => x.entity.Index == stopData.entity.Index);

        const nextVehicleDistanceFmt = stopData.arrivingVehicle ? LocalizedNumber.renderString(localization, {
            value: stopData.arrivingVehicleDistance!,
            unit: Unit.Length,
            signed: false
        }) : "---";
        const stopsYetToPassText = stopData.arrivingVehicle
            ? stopData.arrivingVehicleStops
                ? replaceArgs(translate("lineStationDetail.nextVehicleStopsRemaning"), { stops: stopData.arrivingVehicleStops.toFixed() })
                : translate("lineStationDetail.nextVehicleIncoming")
            : "---";


        return VanillaComponentResolver.CreateInfoSection([
            {
                left: translate("lineViewer.stopData"), uppercase: true, icon: iconWhite, right: <FocusDisabled>
                    {stopData.parent.Index != stopData.entity.Index && <VanillaComponentResolver.instance.ToolButton onSelect={() => focusAndSelect(stopData.parent)} src="coui://uil/Standard/BuildingZoneSignature.svg" tooltip={translate("lineStationDetail.selectBuilding")} />}
                    {inverseStop && <VanillaComponentResolver.instance.ToolButton onSelect={() => focusAndSelect(inverseStop.entity)} src="coui://uil/Standard/Reset.svg" tooltip={translate("lineStationDetail.seeInverseStop")} />}
                    <VanillaComponentResolver.instance.ToolButton onSelect={() => { LineManagementService.setFirstStop(lineDetails!.LineData.entity, thisIdx!); }} src={icon1} disabled={thisIdx === 0} tooltip={translate(thisIdx === 0 ? "lineStationDetail.alreadyFirstStop" : "lineStationDetail.setAsFirstStop")} />
                </FocusDisabled>
            },
            {
                left: translate("lineStationDetail.nextVehicleInformation"), right: stopData.arrivingVehicle ?
                    <div style={{ display: "block" }}>
                        <VanillaComponentResolver.instance.InfoLink onSelect={() => stopData.arrivingVehicle && focusAndSelect(stopData.arrivingVehicle.entity)} >{nameToString(stopData.arrivingVehicle.name)}</VanillaComponentResolver.instance.InfoLink>
                        <div>{nextVehicleDistanceFmt}</div>
                        <div>{stopsYetToPassText}</div>
                    </div>
                    : translate("lineStationDetail.noNextVehicleData")
            }
        ]);
    }
    if (lineDetails?.Stops.some(x => x.parent.Index == selectedEntity?.index)) {
        return <></>;
    }
    const vehicleData = lineDetails?.Vehicles.find(x => x.entity.Index == selectedEntity?.index);
    if (vehicleData) {
        return VanillaComponentResolver.CreateInfoSection([
            { left: translate("lineViewer.vehicleData"), uppercase: true, icon: iconWhite },
            { left: translate("lineViewer.odometer"), right: <>{LocalizedNumber.renderString(localization, { value: vehicleData.odometer, unit: Unit.Length })}</> },
            { left: translate("lineViewer.maintenanceEach"), right: <>{LocalizedNumber.renderString(localization, { value: vehicleData.maintenanceRange, unit: Unit.Length })}</> },
        ]);
    }
    return <></>;

    function focusAndSelect(entity: Entity): any {
        if (camera.focusedEntity$.value.index == entity.Index) selectedInfo.selectEntity(toVanillaEntity(entity));
        return camera.focusEntity(toVanillaEntity(entity));
    }
};
