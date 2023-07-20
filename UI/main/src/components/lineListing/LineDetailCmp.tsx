import { CSSProperties, Component } from "react";
import { NameCustom, NameFormatted, NameLocalized, nameToString } from "#utility/name.utils";
import { Color01, ColorUtils } from "#utility/ColorUtils";
import { TransportType } from "#enum/TransportType";
import { Entity } from "#utility/Entity";
import { SimpleInput } from "../common/input";
import { LineData } from "./LineListCmp";
import { DefaultPanelScreen } from "#components/common/DefaultPanelScreen";
import translate from "#utility/translate";


type State = {
    lineDetails?: {
        LineData: LineData,
        StopCapacity: number,
        Stops: {
            entity: Entity,
            position: number,
            cargo: number,
            isCargo: boolean,
            isOutsideConnection: boolean,
            name: NameCustom | NameFormatted,
            parent: Entity,
            parentName: NameCustom | NameFormatted | NameLocalized,
            district: Entity,
            districtName: NameCustom | NameFormatted,
        }[]
        Vehicles: {
            entity: Entity,
            position: number,
            cargo: number,
            capacity: number,
            isCargo: boolean,
            districtName: NameCustom | NameFormatted | NameLocalized,
        }[],
        Segments: {
            start: number,
            end: number,
            sizeMeters: number,
            broken: boolean
        }
    }
}

type Props = {
    currentLine: LineData,
    onBack: () => void
}

export default class LineDetailCmp extends Component<Props, State> {
    constructor(props: any) {
        super(props);
        this.state = {
        }
    }
    componentDidMount() {
        engine.whenReady.then(async () => {
            engine.on("k45::xtm.lineViewer.getRouteDetail->", (x) => {
                console.log(x);
                this.setState({ lineDetails: x });
                this.reloadLines();
            });
        })
        this.reloadLines(true);
    }
    componentWillUnmount(): void {
        engine.off("k45::xtm.lineViewer.getRouteDetail->");
    }

    async reloadLines(force: boolean = false) {
        await engine.call("k45::xtm.lineViewer.getRouteDetail", this.props.currentLine.entity, force);
    }
    render() {
        if (!this.props.currentLine) {
            return <>INVALID</>
        }
        const buttonsRow = <>
            <button className="negativeBtn " onClick={this.props.onBack}>{translate("paletteEditor.cancel")}</button>
        </>
        return <>
            <DefaultPanelScreen title={nameToString(this.props.currentLine.name)} subtitle="" buttonsRowContent={buttonsRow}>
                {JSON.stringify(this.state.lineDetails ?? "LOADING")}
            </DefaultPanelScreen>
        </>;
    }
    async sendRouteName(lineData: LineData, newName: string) {
        const response: NameFormatted | NameCustom = await engine.call("k45::xtm.lineViewer.setRouteName", lineData.entity, newName)
        return nameToString(response);
    }

    async sendAcronym(entity: Entity, newAcronym: string) {
        try {
            const response = await engine.call("k45::xtm.lineViewer.setAcronym", entity, newAcronym)
            return response;
        } catch (e) {
            console.warn(e);
        }
    }
    async sendRouteNumber(lineData: LineData, newNumber: string) {
        const numberParsed = parseInt(newNumber);
        if (isFinite(numberParsed)) {
            const response: number = await engine.call("k45::xtm.lineViewer.setRouteNumber", lineData.entity, numberParsed)
            return response.toFixed();
        }
        return lineData.routeNumber?.toString();
    }
}

