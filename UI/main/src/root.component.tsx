///<reference path="euis.d.ts" />
import PaletteListCmp from "#components/PaletteListCmp";
import "#components/common/cs2-select.scss";
import { Component } from "react";
import "./root.scss";

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
      <button onClick={() => location.reload()}>RELOAD!!!</button>
      <br />
      <PaletteListCmp />
    </>;
  }
}

/*
 <PaletteEditorCmp></PaletteEditorCmp>
      <LineListCmp></LineListCmp>*/
