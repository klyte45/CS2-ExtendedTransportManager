///<reference path="euis.d.ts" />
import LineListCmp from "#components/lineListing/LineListCmp";
import CityPaletteLibraryCmp from "#components/palettes/CityPaletteLibraryCmp";
import PaletteSetupSettings from "#components/palettes/PaletteSetupSettings";
import "#styles/root.scss";
import translate from "#utility/translate";
import { ErrorBoundary, MainSideTabMenuComponent, MenuItem } from "@klyte45/euis-components";
import { Component } from "react";

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
    const menus: MenuItem[] = [
      {
        iconUrl: "coui://uil/Standard/BusShelter.svg",
        name: translate("lineList.title"),
        panelContent: <LineListCmp />,
        tintedIcon: true
      },
      {
        iconUrl: "coui://uil/Standard/ColorPalette.svg",
        name: translate("cityPalettesLibrary.title"),
        panelContent: <CityPaletteLibraryCmp />
      },
      {     
        iconUrl: "coui://uil/Standard/Tools.svg",
        name: translate("palettesSettings.title"),
        panelContent: <PaletteSetupSettings />
      }
    ]
    return <>
      {/* <button style={{ position: "fixed", right: 0, top: 0, zIndex: 999 }} onClick={() => location.reload()}>RELOAD!!!</button> */}
      <ErrorBoundary>
        <MainSideTabMenuComponent
          items={menus}
          mainIconUrl="coui://xtm.k45/UI/images/XTM.svg"
          modTitle="Extended Transport"
          subtitle="Manager"
          tooltip="Extended Transport Manager"
        />
      </ErrorBoundary>
    </>;
  }
}