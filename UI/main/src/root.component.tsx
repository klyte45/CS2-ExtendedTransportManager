///<reference path="euis.d.ts" />
import PaletteLibrarySelectorCmp from "#components/PaletteLibrarySelectorCmp";
import { Component } from "react";
import PaletteSetupSettings from "#components/PaletteSetupSettings";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import LineListCmp from "#components/LineListCmp";
import translate from "#utility/translate";
import CityPaletteLibraryCmp from "#components/CityPaletteLibraryCmp";
import "#styles/root.scss";
import "#styles/react-tabs.scss"

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
      <br />
      <Tabs>
        <TabList>
          <Tab>{translate("palettesSettings.title")}</Tab>
          <Tab>{translate("palettesLibrary.title")}</Tab>
          <Tab>List of lines</Tab>
          <Tab>CityPaletteLibraryCmp</Tab>
        </TabList>
        <TabPanel><PaletteSetupSettings /></TabPanel>
        <TabPanel><PaletteLibrarySelectorCmp /></TabPanel>
        <TabPanel><LineListCmp /></TabPanel>
        <TabPanel><CityPaletteLibraryCmp /></TabPanel>
      </Tabs>
    </>;
  }
}

/*
 <PaletteEditorCmp></PaletteEditorCmp>
      <LineListCmp></LineListCmp>*/
