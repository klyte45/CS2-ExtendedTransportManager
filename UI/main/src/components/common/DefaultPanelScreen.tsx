import { Component } from "react";

type Props = {
    title: string;
    subtitle: string;
    buttonsRowContent?: JSX.Element
}

export class DefaultPanelScreen extends Component<Props, {}> {

    render() {
        return <>
            <h1>{this.props.title}</h1>
            <h3>{this.props.subtitle}</h3>
            <section style={{ overflow: "scroll", position: "absolute", bottom: this.props.buttonsRowContent ? 52 : 0, left: 5, right: 5, top: 107 }}>
                {this.props.children}
            </section>
            <div style={{ display: "flex", position: "absolute", left: 5, right: 5, bottom: 5, flexDirection: "row-reverse" }}>
                {this.props.buttonsRowContent}
            </div>
        </>
    }
}