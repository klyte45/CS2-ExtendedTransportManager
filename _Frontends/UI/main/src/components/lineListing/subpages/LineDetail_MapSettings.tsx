import { MapViewerOptions } from "#service/LineManagementService";
import translate from "#utility/translate";
import { DefaultPanelScreen, Cs2CheckboxWithLine } from "@klyte45/euis-components";

type LineDetail_MapSettingsData = {
    mapViewOptions: MapViewerOptions;
    setMapViewOptions: (options: MapViewerOptions) => any;
};

export const LineDetail_MapSettings = ({ mapViewOptions, setMapViewOptions }: LineDetail_MapSettingsData): JSX.Element => {

    function toggleWhiteBG(x: boolean): void {
        setMapViewOptions({ ...mapViewOptions, useWhiteBackground: x });
    }

    function toggleUseHalfTripIfSimetric(x: boolean): void {
        setMapViewOptions({ ...mapViewOptions, useHalfTripIfSimetric: x });
    }

    function toggleIntegrations(x: boolean): void {
        setMapViewOptions({ ...mapViewOptions, showIntegrations: x, showVehicles: mapViewOptions.showVehicles && !x });
    }

    function toggleDistricts(x: boolean): void {
        setMapViewOptions({ ...mapViewOptions, showDistricts: x });
    }

    function toggleDistances(x: boolean): void {
        setMapViewOptions({ ...mapViewOptions, showDistances: x });
    }

    function toggleVehiclesShow(x: boolean) {
        setMapViewOptions({ ...mapViewOptions, showVehicles: x, showIntegrations: mapViewOptions.showIntegrations && !x });
    }

    return <DefaultPanelScreen title={translate("lineViewer.showOnMap")} isSubScreen={true}>
        <Cs2CheckboxWithLine isChecked={() => mapViewOptions.showDistances} title={translate("lineViewer.showDistancesLbl")} onValueToggle={(x) => toggleDistances(x)} />
        <Cs2CheckboxWithLine isChecked={() => mapViewOptions.showDistricts} title={translate("lineViewer.showDistrictsLbl")} onValueToggle={(x) => toggleDistricts(x)} />
        <Cs2CheckboxWithLine isChecked={() => mapViewOptions.showVehicles} title={translate("lineViewer.showVehiclesLbl")} onValueToggle={(x) => toggleVehiclesShow(x)} />
        <Cs2CheckboxWithLine isChecked={() => mapViewOptions.showIntegrations} title={translate("lineViewer.showIntegrationsLbl")} onValueToggle={(x) => toggleIntegrations(x)} />
        <Cs2CheckboxWithLine isChecked={() => mapViewOptions.useWhiteBackground} title={translate("lineViewer.useWhiteBackgroundLbl")} onValueToggle={(x) => toggleWhiteBG(x)} />
        <Cs2CheckboxWithLine isChecked={() => mapViewOptions.useHalfTripIfSimetric} title={translate("lineViewer.showHalfTripIfSimmetric")} onValueToggle={(x) => toggleUseHalfTripIfSimetric(x)} />
    </DefaultPanelScreen>;
};
