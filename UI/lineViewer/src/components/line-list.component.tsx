import { CSSProperties, Component } from "react";
import { NameCustom, NameFormatted, NameLocalized, nameToString } from "../utility/name.utils";



type LineData = {
    __Type: string,
    name: NameCustom | NameFormatted,
    vkName: NameLocalized,
    lineData: {
        __Type: string,
        entity: { index: number },
        color: { a: number, r: number, g: number, b: number }
        cargo: number,
        active: boolean,
        visible: boolean,
        isCargo: boolean,
        length: number,
        schedule: number,
        stops: number,
        type: string,
        usage: number,
        vehicles: number,

    },
}

type State = {
    linesList: LineData[]
}
const cachedFormat = new Map;
function formatNumber(e: number, t: string | string[], n: Intl.NumberFormatOptions) {
    return function (locales: string | string[], options: Intl.NumberFormatOptions) {
        options = options || {};
        const idx = locales + JSON.stringify(options);
        let formatter = cachedFormat.get(idx);
        if (!formatter) {
            formatter = new Intl.NumberFormat(locales, options)
            cachedFormat.set(idx, formatter)
        }
        return formatter
    }(t, n).format(e)
}


export default class LineList extends Component<any, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            linesList: []
        }
    }
    componentDidMount() {
        engine.whenReady.then(async () => {
            engine.on("k45::xtm-line-viewer.lineList.update", (res: LineData[]) => {
                console.log(res)
                this.setState({ linesList: res })
            });
            try {
                const rawList = engine.trigger("k45::xtm-line-viewer.lineList.subscribe")
                console.log(rawList);
            } catch (e) { console.log(e) }
        })
    }

    render() {
        return <>
            <h1>List of lines</h1>
            <div className="tableTopRow">
                <div className="w10">Identifier</div>
                <div className="w30">Name</div>
                <div className="w10">Vehicles</div>
                <div className="w20">Length</div>
                <div className="w10">Type</div>
            </div>
            {this.state.linesList.map((x, i) => {
                return <div key={i} className="tableRegularRow">
                    <div className="w10">{x.lineData.entity.index}</div>
                    <div className="w30">{nameToString(x.name)}</div>
                    <div className="w10">{x.lineData.vehicles}</div>
                    <div className="w20">{(x.lineData.length / 1000).toFixed(2) + "km"}</div>
                    <div className="w10">{x.lineData.type}</div>
                </div>;
            })}
        </>;
    }
}

