import { PaletteData } from "#service/PaletteService";
import '#styles/PaletteLineViewer.scss';
import translate from "#utility/translate";
import { ColorRgbInput, ColorUtils, Input, replaceArgs } from "@klyte45/euis-components";
import { CSSProperties, Component } from "react";

type State = {
    paletteData: Mutable<Omit<PaletteData, "ChecksumString">>,
    editingIndex: number
}
type Mutable<Type> = {
    -readonly [Key in keyof Type]: Type[Key];
};

type Props = {
    paletteData: PaletteData
    onBack: () => void,
    onOk: (x: State) => void
}



export default class PaletteImportingCmp extends Component<Props, State> {

    constructor(props: Props | Readonly<Props>) {
        super(props);
        this.state = {
            paletteData: {
                GuidString: props.paletteData.GuidString,
                ColorsRGB: [].concat(props.paletteData.ColorsRGB),
                Name: props.paletteData.Name,
            },
            editingIndex: -1
        }
    }

    render() {
        return <>
            <h1>{translate("paletteEditor.title")}</h1>
            <h3>{translate("paletteEditor.subtitle")}</h3>
            <section style={{ overflow: "scroll", position: "absolute", bottom: this.props.onBack ? 52 : 0, left: 5, right: 5, top: 107 }}>
                <div style={{ textAlign: "center", width: "100%", fontSize: "30rem" } as CSSProperties}>{this.state.paletteData.Name.split("/").pop()}</div>
                <div className="fullDivider" />
                <div className="colorShowcaseContainer" style={{ alignItems: "center", "--lineIconSizeMultiplier": 2 } as CSSProperties}>
                    <div className="colorShowcase">
                        {this.state.paletteData.ColorsRGB.map((clr, j) =>
                            <div className={"lineIconContainer " + (j == this.state.editingIndex ? "currentSelected" : "")} key={j}>
                                <div className="lineIcon" style={{ "--lineColor": clr, "--contrastColor": ColorUtils.toRGBA(ColorUtils.getContrastColorFor(ColorUtils.toColor01(clr))) } as CSSProperties} onClick={() => this.setState({ editingIndex: j })}>
                                    <div className={`routeNum singleLine chars${(j + 1)?.toString().length}`} > {j + 1}</div>
                                </div>
                                <div className="excludeBtn" onClick={() => this.onExclude(j)}>X</div>
                                {j > 0 && <div className="moveMinus" onClick={(x) => this.onMoveColor(j, x.shiftKey ? -Infinity : -1)}>⇚</div>}
                                {j < this.state.paletteData.ColorsRGB.length - 1 && <div className="movePlus" onClick={(x) => this.onMoveColor(j, x.shiftKey ? Infinity : 1)}>⇛</div>}
                            </div>
                        )}
                        <div className="lineIconContainer" onClick={() => this.addNewColor()}>
                            <div className="lineIcon" style={{ "--lineColor": "transparent", "--contrastColor": "white" } as CSSProperties} >
                                <div className={`routeNum singleLine chars1`}>+</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="fullDivider" />
                <div>
                    <Input title={translate("paletteEditor.palettePath")} getValue={() => this.state.paletteData.Name} onValueChanged={(x) => {
                        this.state.paletteData.Name = x;
                        this.setState({ paletteData: this.state.paletteData });
                        return x;
                    }} />
                </div>
                <div>
                    {this.state.editingIndex >= 0 && this.state.editingIndex < this.state.paletteData.ColorsRGB.length && <>
                        <ColorRgbInput
                            title={replaceArgs(translate("paletteEditor.editing"), { "index": (this.state.editingIndex + 1).toString() })}
                            getValue={() => this.state.paletteData.ColorsRGB[this.state.editingIndex]}
                            onValueChanged={(x) => this.setupColor(x)}
                            onTab={(x, shift) => {
                                this.setupColor(x);
                                const newIdx = (this.state.editingIndex + this.state.paletteData.ColorsRGB.length + (shift ? -1 : 1)) % this.state.paletteData.ColorsRGB.length;
                                this.setState({
                                    editingIndex: newIdx
                                });
                                return this.state.paletteData.ColorsRGB[newIdx];
                            }}
                        />
                    </>}
                </div>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>{translate("paletteEditor.tips")}</div>
            </section>
            <div style={{ display: "flex", position: "absolute", left: 5, right: 5, bottom: 5, flexDirection: "row-reverse" }}>
                <button className="negativeBtn " onClick={this.props.onBack}>{translate("paletteEditor.cancel")}</button>
                <button className="positiveBtn " onClick={() => this.props.onOk(this.state)}>{translate("paletteEditor.save")}</button>
            </div>
        </>;
    }

    onExclude(j: number): void {
        this.state.paletteData.ColorsRGB.splice(j, 1);
        this.setState({ paletteData: this.state.paletteData });
    }
    onMoveColor(j: number, delta: number): void {
        var color = this.state.paletteData.ColorsRGB.splice(j, 1);
        this.state.paletteData.ColorsRGB.splice(Math.min(Math.max(j + delta, 0), this.state.paletteData.ColorsRGB.length), 0, ...color);
        this.setState({ paletteData: this.state.paletteData });
    }
    private setupColor(x: string) {
        const newColor = ColorUtils.toRGB6(x);
        if (newColor) {
            this.state.paletteData.ColorsRGB[this.state.editingIndex] = newColor;
            this.setState({ paletteData: this.state.paletteData });
        }
        this.setState({});
        return this.state.paletteData.ColorsRGB[this.state.editingIndex];
    }
    addNewColor() {
        this.state.paletteData.ColorsRGB.push("#FFFFFF");
        this.setState({});
    }
}

