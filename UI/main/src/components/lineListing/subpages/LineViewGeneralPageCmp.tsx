import { Cs2CheckboxWithLine } from "@klyte45/euis-components";
import { LineData, LineManagementService } from "#service/LineManagementService";
import { nameToString } from "@klyte45/euis-components";
import translate from "#utility/translate"
import { Component } from "react";
import { ColorRgbInput, Input } from "@klyte45/euis-components";



export class LineViewGeneralPageCmp extends Component<{ currentLine: LineData; forceReload: () => void }> {

    render() {
        return <>
            <Input title={translate("lineViewerEditor.lineName")} getValue={() => nameToString(this.props.currentLine?.name)} onValueChanged={async (x) => await this.setLineName(x)} />
            <Input title={translate("lineViewerEditor.internalNumber")} getValue={() => this.props.currentLine?.routeNumber.toString()} maxLength={11} onValueChanged={(x) => this.SendNewRouteNumber(x)} />
            <Input title={translate("lineViewerEditor.displayIdentifier")} getValue={() => this.props.currentLine?.xtmData?.Acronym} maxLength={30} onValueChanged={(x) => this.setLineAcronym(x)} />
            <Cs2CheckboxWithLine isChecked={() => this.props.currentLine?.isFixedColor} title={translate("lineViewerEditor.ignorePalette")} onValueToggle={(x) => this.setIgnorePalette(x)} />
            {this.props.currentLine?.isFixedColor && <ColorRgbInput title={translate("lineViewerEditor.lineFixedColor")} getValue={() => this.props.currentLine.color as `#${string}`} onValueChanged={(x) => this.setFixedColor(x)} />}
        </>;
    }

    private setFixedColor(x: string): `#${string}` | Promise<`#${string}`> {
        const result = LineManagementService.setLineFixedColor(this.props.currentLine.entity, x);
        result.then(() => this.props.forceReload());
        return result;
    }

    private setIgnorePalette(x: boolean) {
        LineManagementService.setIgnorePalette(this.props.currentLine.entity, x).then(() => this.props.forceReload());
    }

    private setLineAcronym(x: string): Promise<string> {
        const result = LineManagementService.setLineAcronym(this.props.currentLine.entity, x);
        result.then(() => this.props.forceReload());
        return result;
    }

    private async SendNewRouteNumber(x: string) {
        const lineNum = parseInt(x);
        if (isFinite(lineNum)) {
            const result = LineManagementService.setLineNumber(this.props.currentLine.entity, lineNum);
            result.then(() => this.props.forceReload());
            return result;
        } else {
            return this.props.currentLine.routeNumber.toString();
        }
    }

    private async setLineName(x: string): Promise<string> {
        const result = LineManagementService.setLineName(this.props.currentLine.entity, x);
        result.then(() => this.props.forceReload());
        return nameToString(await result);
    }
}
