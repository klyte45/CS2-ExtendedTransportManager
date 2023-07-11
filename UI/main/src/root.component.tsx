///<reference path="euis.d.ts" />
import React, { Component } from "react";
import "./root.scss"
import "#components/common/cs2-select.scss"
import LineListCmp from "#components/LineListCmp";
import PaletteEditorCmp from "#components/PaletteEditorCmp";
import PaletteListCmp from "#components/PaletteListCmp";

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
