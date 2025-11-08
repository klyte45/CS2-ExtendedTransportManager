import { LineData, LineDetails, LineManagementService, VehicleModel } from "#service/LineManagementService";
import translate from "#utility/translate";
import { ColorRgbInput, Cs2CheckboxWithLine, DefaultPanelScreen, GameScrollComponent, Input, nameToString } from "@klyte45/euis-components";
import "#styles/LineEditor.scss";
import useAsyncMemo from "@klyte45/euis-components/src/utility/useAsyncMemo";
import { PrefabDataService } from "#service/PrefabDataService";
import { ObjectTyped } from "object-typed";
import { TransportType } from "#enum/TransportType";

type Props = {
    lineDetails: LineDetails;
    reloadData: (force?: boolean) => Promise<void>;
};
export const LineDetail_General = ({ lineDetails, reloadData }: Props) => {

    const forceReload = () => reloadData(true);
    const currentLine = lineDetails.LineData;
    const availableVehicleModels = lineDetails.AvailableVehicleModels;
    const selectedVehicleModels = lineDetails.SelectedVehicleModels;

    function setFixedColor(x: string): `#${string}` | Promise<`#${string}`> {
        const result = LineManagementService.setLineFixedColor(currentLine.entity, x);
        result.then(() => forceReload());
        return result;
    }

    function setIgnorePalette(x: boolean) {
        LineManagementService.setIgnorePalette(currentLine.entity, x).then(() => forceReload());
    }

    function setLineAcronym(x: string): Promise<string> {
        const result = LineManagementService.setLineAcronym(currentLine.entity, x);
        result.then(() => forceReload());
        return result;
    }

    async function SendNewRouteNumber(x: string) {
        const lineNum = parseInt(x);
        if (isFinite(lineNum)) {
            const result = LineManagementService.setLineNumber(currentLine.entity, lineNum);
            result.then(() => forceReload());
            return result;
        } else {
            return currentLine.routeNumber.toString();
        }
    }

    async function setLineName(x: string): Promise<string> {
        const result = LineManagementService.setLineName(currentLine.entity, x);
        result.then(() => forceReload());
        return nameToString(await result);
    }
    const uniquePrefabs = [...availableVehicleModels, ...selectedVehicleModels.filter(x => !availableVehicleModels.some(avm => avm.entity.Index === x.entity.Index))];

    const prefabDatas = useAsyncMemo(async () => {
        return ObjectTyped.fromEntries(await Promise.all(Array.from(uniquePrefabs.map(vm => vm.entity)).map(async (e) => [e.Index.toString(), await PrefabDataService.GetPrefabData(e)])));
    }, [lineDetails]);


    return <DefaultPanelScreen title={translate("lineViewer.generalData")} size="h2">
        <Input title={translate("lineViewerEditor.lineName")} getValue={() => nameToString(currentLine?.name)} onValueChanged={async (x) => await setLineName(x)} />
        <Input title={translate("lineViewerEditor.internalNumber")} getValue={() => currentLine?.routeNumber.toString()} maxLength={11} onValueChanged={(x) => SendNewRouteNumber(x)} />
        <Input title={translate("lineViewerEditor.displayIdentifier")} getValue={() => currentLine?.xtmData?.Acronym} maxLength={30} onValueChanged={(x) => setLineAcronym(x)} />
        <Cs2CheckboxWithLine isChecked={() => currentLine?.isFixedColor} title={translate("lineViewerEditor.ignorePalette")} onValueToggle={(x) => setIgnorePalette(x)} />
        {currentLine?.isFixedColor && <ColorRgbInput title={translate("lineViewerEditor.lineFixedColor")} getValue={() => currentLine.color as `#${string}`} onValueChanged={(x) => setFixedColor(x)} />}
        <div className="vehicleModelSelection">
            <h3>{translate("lineViewerEditor.vehiclesSelected")}</h3>
            <GameScrollComponent>
                <div className="buttonContainer">
                    {renderVehicleOptions()}
                </div>
            </GameScrollComponent>
        </div>
    </DefaultPanelScreen >;

    function renderVehicleOptions() {
        if (currentLine.type === TransportType.Train && currentLine.isCargo) {
            return (
                <>
                    <h4>{translate("lineViewerEditor.engineVehicles")}</h4>
                    {drawModelOptions(uniquePrefabs.filter(vm => vm.isSecondary))}
                    <h4>{translate("lineViewerEditor.cargoVehicles")}</h4>
                    {drawModelOptions(uniquePrefabs.filter(vm => !vm.isSecondary))}
                </>
            );
        }
        if (currentLine.type === TransportType.Train) {
            return drawModelOptions(uniquePrefabs.filter(vm => !vm.isSecondary));
        }
        return drawModelOptions(uniquePrefabs);
    }

    function drawModelOptions(availableVehicleModels: VehicleModel[]) {
        return availableVehicleModels.map(vm => {
            const isSelected = selectedVehicleModels.find(svm => svm.entity.Index === vm.entity.Index) !== undefined;
            const toggleVehicleModelSelection = () => {
                isSelected ? LineManagementService.deselectVehicleModel(currentLine.entity, vm) : LineManagementService.selectVehicleModel(currentLine.entity, vm);
                forceReload();
            };
            const prefab = prefabDatas?.[vm.entity.Index];
            return <button className={["modelSelect", isSelected ? "selected" : ""].join(" ").trim()} onClick={toggleVehicleModelSelection} key={vm.entity.Index}>
                <div className="translatedName">{engine.translate(`Assets.NAME[${prefab?.name}]`)}</div>
                <div className="assetName">{`${prefab?.name}`}</div>
            </button>;
        });
    }
}
