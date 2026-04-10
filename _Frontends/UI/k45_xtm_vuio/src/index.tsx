import { VanillaComponentResolver } from "@klyte45/vuio-commons";
import { XtmLineViewer } from "components/LineViewer";
import { selectedInfo, ValueBinding } from "cs2/bindings";
import { FocusDisabled } from "cs2/input";
import { ModRegistrar } from "cs2/modding";
import { useState } from "react";
import "./style/lineViewer.scss";

let IsXtm = false;

const register: ModRegistrar = (moduleRegistry) => {
    moduleRegistry.extend("game-ui/game/components/selected-info-panel/selected-info-sections/route-sections/line-visualizer-section/line-visualizer-canvas.tsx", 'LineVisualizerCanvas', XtmLineViewerRegister)
    moduleRegistry.extend("game-ui/game/components/selected-info-panel/selected-info-sections/route-sections/line-visualizer-section/line-visualizer-section.tsx", 'LineVisualizerSection', XtmLineSectionButtonRegister)
    moduleRegistry.extend("game-ui/game/components/selected-info-panel/selected-info-panel.tsx", 'PanelSpace', XtmLineSelectedInfoPanelRegister)
}

export default register;

const XtmLineSectionButtonRegister = (Component: any): any => {
    return (args: any) => {
        const [isXtm, setIsXtm] = useState(IsXtm);
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
            <div style={{ position: "absolute", top: "5rem", right: "5rem", zIndex: 9999 }}>
                <ToolButton onSelect={() => setIsXtm(x => { IsXtm = !x; return IsXtm; })} src="" selected={isXtm} />
            </div>
        </FocusDisabled>);
        return <div className={isXtm ? "xtm-line-view-container" : ""}>{component}</div>;
    };
};

const XtmLineViewerRegister = (Component: any): any => {
    return (args: any) => <XtmLineViewer args={args} isXtm={IsXtm}><Component {...args} /></XtmLineViewer>;
};

const XtmLineSelectedInfoPanelRegister = (Component: any): any => {
    return (args: any) => {
        const component = Component(args);
        console.log("XtmLineSelectedInfoPanelRegister", component, args);
        return component;
    };
}
