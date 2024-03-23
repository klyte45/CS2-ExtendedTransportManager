import { PaletteData } from "#service/PaletteService";
import { ObjectTyped } from "object-typed";
import { Component } from "react";
import TreeView from "react-treeview";
import { PaletteStructureTreeNode } from "#components/palettes/CityPaletteLibraryCmp";
import { GameScrollComponent } from "@klyte45/euis-components";

export class PaletteCategoryCmp extends Component<{ entry: PaletteStructureTreeNode; doWithPaletteData: (x: PaletteData, i: number) => JSX.Element }, { showing: Record<string, boolean>; }> {

    constructor(props) {
        super(props);
        this.state = {
            showing: {}
        };
    }

    render() {
        return <>
            <GameScrollComponent>
                {ObjectTyped.entries(this.props.entry.subtrees).sort((a, b) => a[0].localeCompare(b[0], undefined, { sensitivity: "base" })).map((x, i) => {
                    return <TreeView
                        nodeLabel={x[0]}
                        key={i}
                        collapsed={!this.state.showing[x[0]]}
                        onClick={() => this.toggle(x[0])}
                    ><PaletteCategoryCmp entry={x[1]} doWithPaletteData={this.props.doWithPaletteData} /></TreeView>;
                })}
                {this.props.entry.rootContent.sort((a, b) => a.Name.localeCompare(b.Name, undefined, { sensitivity: "base" })).map(this.props.doWithPaletteData)}
            </GameScrollComponent>
        </>;
    }
    toggle(item: string): void {
        this.state.showing[item] = !this.state.showing[item];
        this.setState(this.state);
    }
}


export type ExtendedPaletteData = PaletteData & {
    _CurrName?: string;
}


export function categorizePalettes(palettesSaved: ExtendedPaletteData[], iteration: number = 0): Record<string, PaletteStructureTreeNode> {
    return ObjectTyped.fromEntries(ObjectTyped.entries(palettesSaved.reduce((prev, curr) => {
        if (!curr._CurrName) {
            curr._CurrName = curr.Name;
        }

        var splittenName = curr._CurrName.split("/");
        const groupName = splittenName.shift();
        const selfName = splittenName.join("/");
        if (!selfName) {
            prev[""] ??= [];
            prev[""].push(curr);
        } else {
            prev[groupName] ??= [];
            curr._CurrName = selfName;
            prev[groupName].push(curr);
        }
        return prev;
    }, {} as Record<string, ExtendedPaletteData[]>)).map(x => {
        return [
            x[0],
            {
                rootContent: x[1].filter(x => x._CurrName.indexOf("/") == -1),
                subtrees: categorizePalettes(x[1].filter(x => x._CurrName.indexOf("/") >= 0), iteration++)
            } as PaletteStructureTreeNode
        ] as [string, PaletteStructureTreeNode]
    }));
}
