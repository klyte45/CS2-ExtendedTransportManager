import { VanillaComponentResolver, ContextMenuButton, ContextMenuExpansion, replaceArgs } from "@klyte45/vuio-commons";
import { XtmLineViewer } from "components/LineViewer";
import { photo, selectedInfo, ValueBinding } from "cs2/bindings";
import { FocusDisabled } from "cs2/input";
import { ModRegistrar } from "cs2/modding";
import { ReactNode, useEffect, useRef, useState } from "react";
import "#styles/lineViewer.scss";
import iconWhite from "#images/iconWhite.svg";
import i_platformCrowdness from "#images/i_platformCrowdness.svg";
import i_occupancyNone from "#images/i_occupancyNone.svg";
import i_occupancyCurrentHour from "#images/i_occupancyCurrentHour.svg";
import i_occupancyDayAverage from "#images/i_occupancyDayAverage.svg";
import i_occupancy00_04 from "#images/i_occupancy00_04.svg";
import i_occupancy04_08 from "#images/i_occupancy04_08.svg";
import i_occupancy08_12 from "#images/i_occupancy08_12.svg";
import i_occupancy12_16 from "#images/i_occupancy12_16.svg";
import i_occupancy16_20 from "#images/i_occupancy16_20.svg";
import i_occupancy20_24 from "#images/i_occupancy20_24.svg";
import {
    LineManagementService,
    MapViewerOptions,
    SEGMENT_OCCUPANCY_DISPLAY_MODES,
    SegmentOccupancyDisplayMode,
} from "#service/LineManagementService";
import translate from "#utility/translate";
import { InfoRow, InfoSection, Portal } from "cs2/ui";
import { ColorEditorXtm } from "#components/ColorEditorXtm";
import { TicketPriceSectionXtm } from "#components/TicketPriceSectionXtm";
import { SelectVehiclesSectionXtm } from "#components/SelectVehiclesSectionXtm";
import { XtmInfoSection } from "#components/XtmInfoSection";
import { bindValue, useValue } from "cs2/api";
import { XtmMainPanel, XtmButton, XtmMainPanelId } from "#components/mainUI/XtmMainPanel";
import { XtmTransportationOverviewRegister } from "#components/lineListing/XtmTransportationOverviewRegister";
import "#styles/ticketPriceManaged.scss";
import { requestXtmLineMapRefresh, setXtmMapEnabled } from "#utility/xtmLineMapRefresh";

let IsXtm = true;
let xtmOptions: MapViewerOptions = {
    showVehicles: false,
    showDistricts: true,
    showDistances: true,
    showIntegrations: true,
    useWhiteBackground: false,
    useHalfTripIfSimetric: true,
    showPlatformCrowdness: true,
    segmentOccupancyDisplay: "currentHour",
};

const SEGMENT_OCCUPANCY_MODE_ICONS: Record<SegmentOccupancyDisplayMode, string> = {
    none: i_occupancyNone,
    currentHour: i_occupancyCurrentHour,
    dayAverage: i_occupancyDayAverage,
    "00_04": i_occupancy00_04,
    "04_08": i_occupancy04_08,
    "08_12": i_occupancy08_12,
    "12_16": i_occupancy12_16,
    "16_20": i_occupancy16_20,
    "20_24": i_occupancy20_24,
};

const SEGMENT_OCCUPANCY_MODE_LABEL_KEYS: Record<SegmentOccupancyDisplayMode, [string, string]> = {
    none: ["lineViewer.segmentOccupancyMode.none", "None"],
    currentHour: ["lineViewer.segmentOccupancyMode.currentHour", "Current hour"],
    dayAverage: ["lineViewer.segmentOccupancyMode.dayAverage", "Daily average"],
    "00_04": ["lineViewer.segmentOccupancyMode.00_04", "00:00–04:00"],
    "04_08": ["lineViewer.segmentOccupancyMode.04_08", "04:00–08:00"],
    "08_12": ["lineViewer.segmentOccupancyMode.08_12", "08:00–12:00"],
    "12_16": ["lineViewer.segmentOccupancyMode.12_16", "12:00–16:00"],
    "16_20": ["lineViewer.segmentOccupancyMode.16_20", "16:00–20:00"],
    "20_24": ["lineViewer.segmentOccupancyMode.20_24", "20:00–24:00"],
};

const register: ModRegistrar = (moduleRegistry) => {
    moduleRegistry.extend("game-ui/game/components/selected-info-panel/selected-info-sections/route-sections/line-visualizer-section/line-visualizer-canvas.tsx", 'LineVisualizerCanvas', XtmLineViewerRegister)
    moduleRegistry.extend("game-ui/game/components/selected-info-panel/selected-info-sections/route-sections/line-visualizer-section/line-visualizer-section.tsx", 'LineVisualizerSection', XtmLineSectionButtonRegister)

    moduleRegistry.extend("game-ui/game/components/selected-info-panel/selected-info-sections/selected-info-sections.tsx", 'selectedInfoSectionComponents', XtmLayoutOverrideRegistering(() => { }));


    moduleRegistry.extend("game-ui/game/data-binding/game-bindings.ts", 'GamePanelType', RegisterXtmPanelType);
    moduleRegistry.extend("game-ui/game/components/game-panel-renderer.tsx", 'gamePanelComponents', RegisterXtmPanel);
    moduleRegistry.extend("game-ui/editor/components/toolbar/toolbar.tsx", 'Toolbar', XtmPanelEditor);
    moduleRegistry.extend(
        "game-ui/game/components/transportation-overview-panel/transportation-overview-panel.tsx",
        "TransportationOverviewPanel",
        XtmTransportationOverviewRegister,
    );
    moduleRegistry.append('GameTopLeft', XtmButton);
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
                <ToolButton onSelect={() => setIsXtm(x => {
                    IsXtm = !x;
                    setXtmMapEnabled(IsXtm);
                    return IsXtm;
                })} src={iconWhite} selected={isXtm} tooltip={translate("seeXtmMap")} />
                <div style={{ flexGrow: 1 }} />
                {isXtm && <>
                    <ToolButton tooltip={translate("lineViewer.showDistancesLbl")} onSelect={() => setXtmOptionsState(x => xtmOptions = ({ ...x, showDistances: !x.showDistances }))} src={i_distances} selected={xtmOptionsState.showDistances} />
                    <ToolButton tooltip={translate("lineViewer.showDistrictsLbl")} onSelect={() => setXtmOptionsState(x => xtmOptions = ({ ...x, showDistricts: !x.showDistricts }))} src={i_districts} selected={xtmOptionsState.showDistricts} />
                    <ToolButton tooltip={translate("lineViewer.showVehiclesLbl")} onSelect={() => setXtmOptionsState(x => xtmOptions = ({ ...x, showVehicles: !x.showVehicles, showIntegrations: false }))} src={i_vehicles} selected={xtmOptionsState.showVehicles} />
                    <ToolButton tooltip={translate("lineViewer.showIntegrationsLbl")} onSelect={() => setXtmOptionsState(x => xtmOptions = ({ ...x, showIntegrations: !x.showIntegrations, showVehicles: false }))} src={i_integrations} selected={xtmOptionsState.showIntegrations} />
                    <ToolButton tooltip={translate("lineViewer.showPlatformCrowdnessLbl")} onSelect={() => setXtmOptionsState(x => xtmOptions = ({ ...x, showPlatformCrowdness: !x.showPlatformCrowdness }))} src={i_platformCrowdness} selected={xtmOptionsState.showPlatformCrowdness} />
                    <ContextMenuButton
                        src={SEGMENT_OCCUPANCY_MODE_ICONS[xtmOptionsState.segmentOccupancyDisplay]}
                        selected={xtmOptionsState.segmentOccupancyDisplay !== "none"}
                        tooltip={replaceArgs(
                            translate("lineViewer.segmentOccupancyDisplayed", "Segment occupancy displayed: {mode}"),
                            {
                                mode: translate(...SEGMENT_OCCUPANCY_MODE_LABEL_KEYS[xtmOptionsState.segmentOccupancyDisplay]),
                            },
                        )}
                        menuTitle={translate("lineViewer.segmentOccupancyMenuTitle", "Segment occupancy")}
                        menuDirection={ContextMenuExpansion.BOTTOM_LEFT}
                        menuClassName="xtm-popup-solid"
                        focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                        menuItems={SEGMENT_OCCUPANCY_DISPLAY_MODES.map((mode) => {
                            const marker = xtmOptionsState.segmentOccupancyDisplay === mode ? "✓ " : "";
                            return {
                                label: `${marker}${translate(...SEGMENT_OCCUPANCY_MODE_LABEL_KEYS[mode])}`,
                                action: () => setXtmOptionsState((x) => (
                                    xtmOptions = { ...x, segmentOccupancyDisplay: mode }
                                )),
                            };
                        })}
                    />
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
        const selectedEntity = useValue(selectedInfo.selectedEntity$);
        const selectedRoute = useValue(selectedInfo.selectedRoute$)
        if (selectedEntity?.index != selectedRoute?.index) {
            return <_originalColor {...args} />;
        }
        return <ColorEditorXtm {...args} />;
    };

    const _originalSchedule = componentList["Game.UI.InGame.ScheduleSection"];
    componentList["Game.UI.InGame.ScheduleSection"] = (args: any) => {
        const selectedEntity = useValue(selectedInfo.selectedEntity$);
        const selectedRoute = useValue(selectedInfo.selectedRoute$);
        const isRoute = selectedEntity?.index === selectedRoute?.index;
        const prevSchedule = useRef<number | undefined>(undefined);
        useEffect(() => {
            prevSchedule.current = undefined;
        }, [selectedEntity?.index]);
        useEffect(() => {
            if (!isRoute) {
                prevSchedule.current = args.schedule;
                return;
            }
            if (prevSchedule.current === undefined) {
                prevSchedule.current = args.schedule;
                return;
            }
            if (prevSchedule.current !== args.schedule) {
                prevSchedule.current = args.schedule;
                requestXtmLineMapRefresh();
            }
        }, [args.schedule, isRoute, selectedEntity]);
        return <_originalSchedule {...args} />;
    };

    const _originalActions = componentList["Game.UI.InGame.ActionsSection"];
    componentList["Game.UI.InGame.ActionsSection"] = (args: any) => {
        const selectedEntity = useValue(selectedInfo.selectedEntity$);
        const selectedRoute = useValue(selectedInfo.selectedRoute$);
        const isRoute = selectedEntity?.index === selectedRoute?.index;
        const prevDisabled = useRef<boolean | undefined>(undefined);
        useEffect(() => {
            prevDisabled.current = undefined;
        }, [selectedEntity?.index]);
        useEffect(() => {
            if (!isRoute || !args.disableable) {
                prevDisabled.current = args.disabled;
                return;
            }
            if (prevDisabled.current === undefined) {
                prevDisabled.current = args.disabled;
                return;
            }
            if (prevDisabled.current !== args.disabled) {
                prevDisabled.current = args.disabled;
                requestXtmLineMapRefresh();
            }
        }, [args.disabled, args.disableable, isRoute, selectedEntity]);
        return <_originalActions {...args} />;
    };

    const _originalTicketPrice = componentList["Game.UI.InGame.TicketPriceSection"];
    componentList["Game.UI.InGame.TicketPriceSection"] = (args: any) => {
        const selectedEntity = useValue(selectedInfo.selectedEntity$);
        const selectedRoute = useValue(selectedInfo.selectedRoute$);
        if (selectedEntity?.index != selectedRoute?.index) {
            return <_originalTicketPrice {...args} />;
        }
        return <TicketPriceSectionXtm {...args} Original={_originalTicketPrice} />;
    };
    const _originalSelectVehicles = componentList["Game.UI.InGame.SelectVehiclesSection"];
    componentList["Game.UI.InGame.SelectVehiclesSection"] = (args: any) => {
        const selectedEntity = useValue(selectedInfo.selectedEntity$);
        const selectedRoute = useValue(selectedInfo.selectedRoute$);
        if (selectedEntity?.index != selectedRoute?.index) {
            return <_originalSelectVehicles {...args} />;
        }
        return <SelectVehiclesSectionXtm {...args} Original={_originalSelectVehicles} />;
    };

    // Line Data right after vanilla "Public transport line" (LineSection is before TicketPrice in C# order).
    // Standalone XTM middle section stays last for stop/vehicle SIP; suppress it on the route itself.
    const _originalLine = componentList["Game.UI.InGame.LineSection"];
    componentList["Game.UI.InGame.LineSection"] = (args: any) => (
        <>
            <_originalLine {...args} />
            <XtmInfoSection />
        </>
    );
    componentList["BelzontTLM.XTMInfoPanelSystem"] = () => {
        const selectedEntity = useValue(selectedInfo.selectedEntity$);
        const selectedRoute = useValue(selectedInfo.selectedRoute$);
        if (selectedEntity?.index === selectedRoute?.index) return null;
        return <XtmInfoSection />;
    };
    return componentList as any;
};


const RegisterXtmPanelType = (input: any) => {
    input["K45_XTM"] = XtmMainPanelId
    console.log("Registered XTM Panel Type", input)
    return input;
}

const RegisterXtmPanel = (input: any) => {
    console.log("Registering XTM Panel", input)
    input[XtmMainPanelId] = XtmMainPanel
    return input;
}

const XtmPanelEditor = (input: any) => {
    const editorGroup = "editorTool"
    const editorSelection = "activeTool"
    const engine = (window as any).engine;
    return (args: any) => {
        const bindResult = bindValue(editorGroup, editorSelection);
        const [tabActive, setTabActive] = useState(0)
        useEffect(() => {

            engine.whenReady.then(() => {
                engine.on("k45::xtm.main.setTabActive", setTabActive)
            })

            return () => engine.off("k45::xtm.main.setTabActive", setTabActive)
        }, [])
        return <>
            {input(args)}
            {bindResult.value === "k45__xtm_MainWindow" && <Portal>
                <XtmMainPanel selectedTab={tabActive} noClose moveable />
            </Portal>}
        </>
    }
}