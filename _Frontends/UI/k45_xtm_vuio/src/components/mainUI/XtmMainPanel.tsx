
import icon from "images/iconWhite.svg"
import { Button, Panel, Tooltip } from "cs2/ui";
import { VanillaComponentResolver } from "@klyte45/vuio-commons";
import classNames from "classnames";
import "./mainUi.scss"
import engine from "cohtml/cohtml";
import translate from "#utility/translate";
import { CityPaletteSettings } from "./CityPaletteSettings";

export const XtmMainPanelId = "BelzontTLM.UI.XTMMainPanel";

export const XtmButton = () => {
    return (
        <Tooltip tooltip="Xtended Transport Manager">
            <Button
                src={icon}
                variant="floating"
                onSelect={() => VanillaComponentResolver.instance.toggleGamePanel(XtmMainPanelId)}
            />
        </Tooltip>
    );
}

type MainPanelProps = { selectedTab?: number, noClose?: boolean, moveable?: boolean }
enum Tabs {
    PaletteSettings = "PaletteSettings",
    PaletteEditor = "PaletteEditor"
}
function getTitleForTab(tab: Tabs) {
    return {
        [Tabs.PaletteEditor]: "cityPalettesLibrary.title",
        [Tabs.PaletteSettings]: "palettesSettings.title"
    }[tab];
}
export const XtmMainPanel = ({ selectedTab = 0, noClose, moveable }: MainPanelProps) => {
    const PanelTitleBar = VanillaComponentResolver.instance.PanelTitleBar;
    const Tab = VanillaComponentResolver.instance.Tab;
    const TabBar = VanillaComponentResolver.instance.TabBar;
    const TabNav = VanillaComponentResolver.instance.TabNav;
    const tabs = Object.values(Tabs);

    const onSelect = (i: string) => { engine.trigger("k45::xtm.main.setTabActive", tabs.indexOf(i as any)) }
    const selectedTabId = tabs[selectedTab]

    const header = <>
        <PanelTitleBar className="k45_xtm_mainPanel_title" onCloseOverride={noClose ? undefined : (() => VanillaComponentResolver.instance.toggleGamePanel(XtmMainPanelId))}>Xtended Transport Manager</PanelTitleBar>
    </>

    return <div className={classNames(VanillaComponentResolver.instance.gameMainScreenModule.centerPanelLayout, "k45_xtm_mainPanel")} style={{}}>
        <Panel header={header} draggable={moveable}>
            <TabBar className="k45_xtm_mainPanel_tabBar">{
                tabs.map(x => <Tab id={x} selectedId={selectedTabId} onSelect={onSelect} >{translate(getTitleForTab(x))}</Tab>)
            }</TabBar>
            <TabNav tabs={tabs} selectedTab={selectedTabId}>
                <div className="k45_xtm_mainPanel_content">
                    {selectedTabId === Tabs.PaletteEditor && <div className="k45_xtm_mainPanel_paletteEditor"><CityPaletteEditor /></div>}
                    {selectedTabId === Tabs.PaletteSettings && <div className="k45_xtm_mainPanel_paletteSettings"><CityPaletteSettings /></div>}
                </div>
            </TabNav>
        </Panel>
    </div>;
}


function CityPaletteEditor(args: any) {
    return <div>City Palette Editor</div>
}

