import { LineData, LineManagementService } from "#service/LineManagementService";
import translate from "#utility/translate";
import { ColorRgbInput, Cs2CheckboxWithLine, DefaultPanelScreen, Input, nameToString } from "@klyte45/euis-components";


type Props = {
    lineCommonData: LineData;
    reloadData: (force?: boolean) => Promise<void>;
};
export const LineDetail_General = ({ lineCommonData: currentLine, reloadData }: Props) => {

    const forceReload = () => reloadData(true);

    function setFixedColor(x: string): `#${string}` | Promise<`#${string}`> {
        const result = LineManagementService.setLineFixedColor(currentLine.entity, x);
        result.then(() => forceReload());
        return result;
    }

    function setIgnorePalette(x: boolean) {
        LineManagementService.setIgnorePalette(currentLine.entity, x).then(() => forceReload());
    }

    function setLineAcronym(x: string): Promise<string> {
        const result = LineManagementService.setLineAcronym(currentLine.entity, x);
        result.then(() => forceReload());
        return result;
    }

    async function SendNewRouteNumber(x: string) {
        const lineNum = parseInt(x);
        if (isFinite(lineNum)) {
            const result = LineManagementService.setLineNumber(currentLine.entity, lineNum);
            result.then(() => forceReload());
            return result;
        } else {
            return currentLine.routeNumber.toString();
        }
    }

    async function setLineName(x: string): Promise<string> {
        const result = LineManagementService.setLineName(currentLine.entity, x);
        result.then(() => forceReload());
        return nameToString(await result);
    }


    return <DefaultPanelScreen title={translate("lineViewer.generalData")} isSubScreen={true}>
        < Input title={translate("lineViewerEditor.lineName")} getValue={() => nameToString(currentLine?.name)} onValueChanged={async (x) => await setLineName(x)} />
        <Input title={translate("lineViewerEditor.internalNumber")} getValue={() => currentLine?.routeNumber.toString()} maxLength={11} onValueChanged={(x) => SendNewRouteNumber(x)} />
        <Input title={translate("lineViewerEditor.displayIdentifier")} getValue={() => currentLine?.xtmData?.Acronym} maxLength={30} onValueChanged={(x) => setLineAcronym(x)} />
        <Cs2CheckboxWithLine isChecked={() => currentLine?.isFixedColor} title={translate("lineViewerEditor.ignorePalette")} onValueToggle={(x) => setIgnorePalette(x)} />
        {currentLine?.isFixedColor && <ColorRgbInput title={translate("lineViewerEditor.lineFixedColor")} getValue={() => currentLine.color as `#${string}`} onValueChanged={(x) => setFixedColor(x)} />}
    </DefaultPanelScreen >;
}
