import { CSSProperties, Component } from "react";
import translate from "#utility/translate";
import { PaletteService, PaletteData } from "#service/PaletteService";
import { ColorUtils } from "#utility/ColorUtils";
import { ObjectTyped } from "object-typed";
import TreeView from "react-treeview"

type State = {
    availablePalettes: PaletteStructureTreeNode,
}

type PaletteStructureTreeNode = {
    rootContent: PaletteData[],
    subtrees: Record<string, PaletteStructureTreeNode>
}



export default class PaletteListCmp extends Component<any, State> {

    constructor(props) {
        super(props);
        this.state = {
            availablePalettes: { subtrees: {}, rootContent: [] }
        }
    }
    componentDidMount() {
        const _this = this;
        engine.whenReady.then(async () => {
            this.updatePalettes();
        })
    }
    private async updatePalettes() {
        const palettesSaved = await PaletteService.listLibraryPalettes();
        const paletteTree = categorizePalettes(palettesSaved)
        const root = paletteTree[""]?.rootContent ?? []
        delete paletteTree[""];
        this.setState({
            availablePalettes: {
                rootContent: root,
                subtrees: paletteTree
            }
        });
    }

    render() {
        return <>
            <h1>{translate("palettesLibrary.title")}</h1>
            <h3>{translate("palettesLibrary.subtitle")}</h3>
            <section>
                <PaletteCategoryCmp entry={this.state?.availablePalettes} />
            </section>
        </>;
    }
}

class PaletteCategoryCmp extends Component<{ entry: PaletteStructureTreeNode }, { showing: Record<string, boolean> }>{

    constructor(props) {
        super(props);
        this.state = {
            showing: {}
        }
    }

    render() {
        return <>
            {ObjectTyped.entries(this.props.entry.subtrees).sort((a, b) => a[0].localeCompare(b[0])).map((x, i) => {
                return <TreeView
                    nodeLabel={x[0]}
                    key={i}
                    collapsed={!this.state.showing[x[0]]}
                    onClick={() => this.toggle(x[0])}
                ><PaletteCategoryCmp entry={x[1]} /></TreeView>
            })}
            {this.props.entry.rootContent.sort((a, b) => a.Name.localeCompare(b.Name)).map((x, i) => {
                return <PaletteLineViewer entry={x} key={i} />
            })}
        </>
    }
    toggle(item: string): void {
        this.state.showing[item] = !this.state.showing[item];
        this.setState(this.state);
    }
}

class PaletteLineViewer extends Component<{ entry: PaletteData }> {
    render() {
        return <div className="paletteViewer">
            <label className="w10">{this.props.entry.Name}</label>
            <div className="colorShowcaseContainer w90">
                <div className="colorShowcase">
                    {
                        this.props.entry.ColorsRGB.map((clr, j) =>
                            <div className="lineIcon" style={{ "--lineColor": clr, "--contrastColor": ColorUtils.toRGBA(ColorUtils.getContrastColorFor(ColorUtils.toColor01(clr))) } as CSSProperties} key={j}>
                                <div className={`routeNum chars${(j + 1)?.toString().length}`}> {j + 1}</div>
                            </div>)
                    }
                </div>
            </div>
        </div>
    }
}



function categorizePalettes(palettesSaved: PaletteData[], iteration: number = 0): Record<string, PaletteStructureTreeNode> {
    return ObjectTyped.fromEntries(ObjectTyped.entries(palettesSaved.reduce((prev, curr) => {
        var splittenName = curr.Name.split("/");
        const groupName = splittenName.shift();
        const selfName = splittenName.join("/");
        if (!selfName) {
            prev[""] ??= [];
            prev[""].push(curr);
        } else {
            prev[groupName] ??= [];
            curr.Name = selfName;
            prev[groupName].push(curr);
        }
        return prev;
    }, {} as Record<string, PaletteData[]>)).map(x => {
        return [
            x[0],
            {
                rootContent: x[1].filter(x => x.Name.indexOf("/") == -1),
                subtrees: categorizePalettes(x[1].filter(x => x.Name.indexOf("/") >= 0), iteration++)
            } as PaletteStructureTreeNode
        ] as [string, PaletteStructureTreeNode]
    }));
}
