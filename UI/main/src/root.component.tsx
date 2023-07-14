///<reference path="euis.d.ts" />
import PaletteListCmp from "#components/PaletteListCmp";
import "#components/common/cs2-select.scss";
import { Component } from "react";
import "./root.scss";
import './styles/treeview.scss'
import './styles/react-tabs.scss';
import PaletteEditorCmp from "#components/PaletteEditorCmp";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import LineListCmp from "#components/LineListCmp";
import translate from "#utility/translate";

type State = {
  lastIdx: number
  otherX: number
}

export default class Root extends Component<any, State> {
  constructor(props) {
    super(props);
    this.state = {
      lastIdx: -1,
      otherX: 92
    }
  }
  componentDidMount() {
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
        </TabList>
        <TabPanel><PaletteEditorCmp /></TabPanel>
        <TabPanel><PaletteListCmp /></TabPanel>
        <TabPanel><LineListCmp /></TabPanel>
      </Tabs>
    </>;
  }
}

/*
 <PaletteEditorCmp></PaletteEditorCmp>
      <LineListCmp></LineListCmp>*/
