import { LineDetails, LineData } from "#service/LineManagementService";
import translate from "#utility/translate";
import { UnitSystem, DefaultPanelScreen, Cs2FormLine, metersTo, replaceArgs, kilogramsTo, durationToGameMinutes, nameToString, setupSignificance } from "@klyte45/euis-components";

type LineDetail_DataProps = {
    lineDetails: LineDetails; measureUnit: UnitSystem; lineCommonData: LineData;
};
export const LineDetail_Data = ({ lineDetails, measureUnit, lineCommonData }: LineDetail_DataProps): JSX.Element => {
    console.log({ lineDetails, lineCommonData });
    return <DefaultPanelScreen title={translate("lineViewer.lineData")} size="h2">
        <Cs2FormLine title={translate("lineViewer.dataTotalLength")}>{[metersTo(lineDetails.Segments.reduce((p, n) => p + n.sizeMeters, 0), measureUnit)].map(x => replaceArgs(engine.translate(x[0]), { ...x[1], "SIGN": "" }))[0]}</Cs2FormLine>
        <Cs2FormLine title={translate("lineViewer.dataVehicleCount")}>{lineCommonData.vehicles}</Cs2FormLine>
        <Cs2FormLine title={translate("lineViewer.dataStopsCount")}>{lineCommonData.stops}</Cs2FormLine>
        <Cs2FormLine title={translate(lineCommonData.isCargo ? "lineViewer.dataTotalCargoWaiting" : "lineViewer.dataTotalPassengersWaiting")}>{lineCommonData.isCargo
            ? [kilogramsTo(lineDetails.Stops.reduce((p, n) => p + n.cargo, 0), measureUnit)].map(x => replaceArgs(engine.translate(x[0]), { ...x[1], "SIGN": "" }))[0]
            : lineDetails.Stops.reduce((p, n) => p + n.cargo, 0)}</Cs2FormLine>
        <Cs2FormLine title={translate("lineViewer.dataLineFullLapAverageTime")}>{replaceArgs(translate("lineViewer.formatMinutes"), { minutes: durationToGameMinutes(lineDetails.Segments.reduce((p, n) => p + n.duration, 0)).toFixed() })}</Cs2FormLine>
        <Cs2FormLine title={translate("lineViewer.dataNextVehicleToBeMaintained")}>
            {lineDetails.Vehicles.filter(x => x.maintenanceRange > 0).sort((a, b) => (a.odometer - a.maintenanceRange) - (b.odometer - b.maintenanceRange)).filter((x, i) => i == 0).map(x => <>
                {replaceArgs(translate("lineViewer.dataNextMaintenanceValueFmt"), { name: `${nameToString(x.name)}`, distance: [metersTo(x.maintenanceRange - x.odometer, measureUnit)].map(x => replaceArgs(engine.translate(x[0]), { ...x[1], "SIGN": "" }))[0] })}
            </>)[0] || translate("lineViewer.dataNoNextMaintenance")}
        </Cs2FormLine>
        <Cs2FormLine title={translate("lineViewer.dataAverageVehicleOccupance")}>{setupSignificance(lineDetails.Vehicles.reduce((p, n) => p + n.cargo / n.capacity, 0) / lineCommonData.vehicles * 100, 2)}%</Cs2FormLine>        
        <Cs2FormLine title={translate("lineViewer.dataAverageStopWaiting")}>{setupSignificance(lineDetails.Stops.reduce((p, n) => p + n.cargo / lineDetails.StopCapacity, 0) / lineCommonData.stops * 100, 2)}%</Cs2FormLine>
    </DefaultPanelScreen>;
};
