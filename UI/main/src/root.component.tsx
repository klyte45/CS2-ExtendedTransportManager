///<reference path="euis.d.ts" />
import LineListCmp from "#components/lineListing/LineListCmp";
import CityPaletteLibraryCmp from "#components/palettes/CityPaletteLibraryCmp";
import PaletteSetupSettings from "#components/palettes/PaletteSetupSettings";
import "#styles/react-tabs.scss";
import "#styles/root.scss";
import translate from "#utility/translate";
import { Component } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";

type State = {
  lastIdx: number
  otherX: number
}

export default class Root extends Component<any, State> {
  constructor(props) {
    super(props);
    this.state = {
      lastIdx: -1,
      otherX: 92,
    }
  }
  componentDidMount() {
    engine.whenReady.then(() => {
      engine.on("k45::euis.localeChanged", () => this.setState({}))
    })
  }



  render() {
    return <>
      <button style={{ position: "fixed", right: 0, top: 0, zIndex: 999 }} onClick={() => location.reload()}>RELOAD!!!</button>
      <Tabs defaultIndex={2}>
        <TabList>
          <Tab>{translate("cityPalettesLibrary.title")}</Tab>
          <Tab>{translate("palettesSettings.title")}</Tab>
          <Tab>{translate("lineList.title")}</Tab>
        </TabList>
        <TabPanel><CityPaletteLibraryCmp /></TabPanel>
        <TabPanel><PaletteSetupSettings /></TabPanel>
        <TabPanel><LineListCmp /></TabPanel>
      </Tabs>
    </>;
  }
}

/*<button style={{ position: "fixed", right: 0, top: 0, zIndex: 999 }} onClick={() => location.reload()}>RELOAD!!!</button>
 <PaletteEditorCmp></PaletteEditorCmp>
      <LineListCmp></LineListCmp>*/
