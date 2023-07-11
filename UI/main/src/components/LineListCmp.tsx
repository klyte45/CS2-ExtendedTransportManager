import { CSSProperties, Component } from "react";
import { NameCustom, NameFormatted, NameLocalized, nameToString } from "#utility/name.utils";
import { Color01, ColorUtils } from "#utility/ColorUtils";

type LineData = {
    __Type: string,
    name: NameCustom | NameFormatted,
    vkName: NameLocalized,
    lineData: {
        __Type: string,
        entity: { index: number },
        color: Color01
        cargo: number,
        active: boolean,
        visible: boolean,
        isCargo: boolean,
        length: number,
        schedule: number,
        stops: number,
        type: string,
        usage: number,
        vehicles: number
    },
    xtmData?: {
        acronym: string
    }
    routeNumber: number
}

type State = {
    linesList: LineData[]
}


export default class LineListCmp extends Component<any, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            linesList: []
        }
    }
    componentDidMount() {
        engine.whenReady.then(async () => {
            engine.on("k45::xtm.lineList.update", (res: LineData[]) => {
                this.setState({ linesList: res });
            });
            try {
                engine.trigger("k45::xtm.lineList.subscribe")
            } catch (e) { console.log(e) }
        })
    }

    render() {
        return <>
            <h1>List of lines</h1>
            <div className="tableTopRow">
                <div className="w05">Identifier</div>
                <div className="w05">Acronym</div>
                <div className="w20">Name</div>
                <div className="w05">Vehicles</div>
                <div className="w10">Length</div>
                <div className="w05">Type</div>
                <div className="w10"> </div>
            </div>
            {this.state.linesList.map((x, i) => {
                return <div key={i} className="tableRegularRow">
                    <div className="w05">{x.lineData.entity.index}</div>
                    <div className="w05">{x.xtmData?.acronym ?? <i>N/A</i>}</div>
                    <div className="w20 lineIconParent">
                        <div className={`lineIcon`} style={{ "--lineColor": ColorUtils.toRGBA(x.lineData.color), "--contrastColor": ColorUtils.toRGBA(ColorUtils.getContrastColorFor(x.lineData.color)) } as CSSProperties}>
                            <div className={`routeNum chars${x.routeNumber?.toString().length}`}>{x.routeNumber}</div>
                        </div>
                        {nameToString(x.name)}
                    </div>
                    <div className="w05">{x.lineData.vehicles}</div>
                    <div className="w10">{(x.lineData.length / 1000).toFixed(2) + " km"}</div>
                    <div className="w05">{x.lineData.type}</div>
                    <div className="w10"><input type="text" onBlur={(y) => sendAcronym(x.lineData.entity.index, y.target.value)} maxLength={32} placeholder={x.xtmData?.acronym}></input></div>
                </div>;
            })}
        </>;
    }
}

async function sendAcronym(index: number, newAcronym: string) {
    try {
        console.log("sending: " + index + "|" + newAcronym)
        const response = await engine.call("k45::xtm.setAcronym", index, newAcronym)
        console.log("Response: " + response);
    } catch (e) {
        console.warn(e);
    }
}