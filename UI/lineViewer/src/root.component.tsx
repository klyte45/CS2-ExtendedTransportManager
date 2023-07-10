///<reference path="euis.d.ts" />
import React, { Component } from "react";
import "./root.scss"
import "#components/common/cs2-select.scss"
import LineList from "#components/line-list.component";
import PaletteEditor from "#components/palette-editor.component";

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
      <PaletteEditor></PaletteEditor>
      <LineList></LineList>
    </>;
  }
}


