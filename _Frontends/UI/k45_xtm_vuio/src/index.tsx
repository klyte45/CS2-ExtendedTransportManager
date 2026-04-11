import { VanillaComponentResolver } from "@klyte45/vuio-commons";
import { XtmLineViewer } from "components/LineViewer";
import { photo, selectedInfo, ValueBinding } from "cs2/bindings";
import { FocusDisabled } from "cs2/input";
import { ModRegistrar } from "cs2/modding";
import { ReactNode, useState } from "react";
import "#styles/lineViewer.scss";
import iconWhite from "#images/iconWhite.svg";
import { MapViewerOptions } from "#service/LineManagementService";
import translate from "#utility/translate";
import { InfoRow, InfoSection } from "cs2/ui";
import { ColorEditorXtm } from "#components/ColorEditorXtm";

let IsXtm = true;
let xtmOptions: MapViewerOptions = {
    showVehicles: false,
    showDistricts: true,
    showDistances: true,
    showIntegrations: true,
    useWhiteBackground: false,
    useHalfTripIfSimetric: true
}

const register: ModRegistrar = (moduleRegistry) => {
    moduleRegistry.extend("game-ui/game/components/selected-info-panel/selected-info-sections/route-sections/line-visualizer-section/line-visualizer-canvas.tsx", 'LineVisualizerCanvas', XtmLineViewerRegister)
    moduleRegistry.extend("game-ui/game/components/selected-info-panel/selected-info-sections/route-sections/line-visualizer-section/line-visualizer-section.tsx", 'LineVisualizerSection', XtmLineSectionButtonRegister)

    moduleRegistry.extend("game-ui/game/components/selected-info-panel/selected-info-sections/selected-info-sections.tsx", 'selectedInfoSectionComponents', XtmLayoutOverrideRegistering(() => { }))
}

export default register;

const XtmLineSectionButtonRegister = (Component: any): any => {
    return (args: any) => {
        const [isXtm, setIsXtm] = useState(IsXtm);
        const [xtmOptionsState, setXtmOptionsState] = useState(xtmOptions);

        const i_distances = "coui://uil/Standard/MeasureEven.svg";
        const i_districts = "coui://uil/Standard/Building Themes.svg";
        const i_vehicles = "coui://uil/Standard/GenericVehicles.svg";
        const i_integrations = "coui://uil/Standard/BusShelter.svg";
        const i_whiteBackground = "coui://uil/Standard/SingleRhombus.svg";
        const i_halfTrip = "coui://uil/Standard/ArrowDownSliderShortFilled.svg";

        if (isXtm) {
            args.width = 500;
        } else {
            args.width = 140;
        }
        var component = Component(args);
        if (!Array.isArray(component.props.children)) {
            component.props.children = [component.props.children];
        }
        const ToolButton = VanillaComponentResolver.instance.ToolButton;
        component.props.children.unshift(<FocusDisabled>
            <div style={{ position: "absolute", top: "5rem", right: "5rem", left: "5rem", zIndex: 9999, display: "flex", flexDirection: "row", }}>
                <ToolButton onSelect={() => setIsXtm(x => { IsXtm = !x; return IsXtm; })} src={iconWhite} selected={isXtm} tooltip={translate("seeXtmMap")} />
                <div style={{ flexGrow: 1 }} />
                {isXtm && <>
                    <ToolButton tooltip={translate("lineViewer.showDistancesLbl")} onSelect={() => setXtmOptionsState(x => xtmOptions = ({ ...x, showDistances: !x.showDistances }))} src={i_distances} selected={xtmOptionsState.showDistances} />
                    <ToolButton tooltip={translate("lineViewer.showDistrictsLbl")} onSelect={() => setXtmOptionsState(x => xtmOptions = ({ ...x, showDistricts: !x.showDistricts }))} src={i_districts} selected={xtmOptionsState.showDistricts} />
                    <ToolButton tooltip={translate("lineViewer.showVehiclesLbl")} onSelect={() => setXtmOptionsState(x => xtmOptions = ({ ...x, showVehicles: !x.showVehicles, showIntegrations: false }))} src={i_vehicles} selected={xtmOptionsState.showVehicles} />
                    <ToolButton tooltip={translate("lineViewer.showIntegrationsLbl")} onSelect={() => setXtmOptionsState(x => xtmOptions = ({ ...x, showIntegrations: !x.showIntegrations, showVehicles: false }))} src={i_integrations} selected={xtmOptionsState.showIntegrations} />
                    <ToolButton tooltip={translate("lineViewer.useWhiteBackgroundLbl")} onSelect={() => setXtmOptionsState(x => xtmOptions = ({ ...x, useWhiteBackground: !x.useWhiteBackground }))} src={i_whiteBackground} selected={xtmOptionsState.useWhiteBackground} />
                    <ToolButton tooltip={translate("lineViewer.showHalfTripIfSimmetric")} onSelect={() => setXtmOptionsState(x => xtmOptions = ({ ...x, useHalfTripIfSimetric: !x.useHalfTripIfSimetric }))} src={i_halfTrip} selected={xtmOptionsState.useHalfTripIfSimetric} />
                </>}
            </div>
        </FocusDisabled>);
        return <div className={isXtm ? "xtm-line-view-container" : ""}>{component}</div>;
    };
};

const XtmLineViewerRegister = (Component: any): any => {
    return (args: any) => <XtmLineViewer args={args} isXtm={IsXtm} xtmOptions={xtmOptions}><Component {...args} /></XtmLineViewer>;
};

const XtmLayoutOverrideRegistering = (onChange?: () => any) => (componentList: any): any => {
    const _originalColor = componentList["Game.UI.InGame.ColorSection"]
    componentList["Game.UI.InGame.ColorSection"] = (args: any) => {
        if (selectedInfo.selectedEntity$.value?.index != selectedInfo.selectedRoute$.value?.index) {
            return <_originalColor {...args} />;
        }
        return <ColorEditorXtm {...args} />;
    };
    componentList["BelzontTLM.XTMInfoPanelSystem"] = () => <>XTM GOES HERE</>;
    return componentList as any;
};

