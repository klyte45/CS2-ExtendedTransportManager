import { LineManagementService } from "#service/LineManagementService";
import translate from "#utility/translate";
import { toEntityTyped, ColorUtils, VanillaComponentResolver } from "@klyte45/vuio-commons";
import engine from "cohtml/cohtml";
import { trigger } from "cs2/api";
import { selectedInfo } from "cs2/bindings";
import { FormattedParagraphs } from "cs2/ui";
import { useState, useEffect } from "react";

type Props = {
    group: string;
    tooltipTags: string[];
    tooltipKeys: string[];
};
export const ColorEditorXtm = ({ group, tooltipTags, tooltipKeys }: Props) => {
    const [isIgnorePalette, setIsIgnorePalette] = useState(false);
    const [fixedColor, setFixedColor] = useState("#ffffff");

    useEffect(() => {
        LineManagementService.getIgnorePalette(toEntityTyped(selectedInfo.selectedEntity$.value)).then(setIsIgnorePalette);
        LineManagementService.getRouteFixedColor(toEntityTyped(selectedInfo.selectedEntity$.value)).then(setFixedColor);
    }, [selectedInfo.selectedEntity$.value.index]);

    const onChangeIsIgnorePalette = (value: boolean) => LineManagementService.setIgnorePalette(toEntityTyped(selectedInfo.selectedEntity$.value), value).then(setIsIgnorePalette);
    const onChangeFixedColor = (value: string) => {
        trigger("ColorSection", "setColor", { ...ColorUtils.toColor01(value), __Type: "Game.UI.Common.UIColor" });
        LineManagementService.setLineFixedColor(toEntityTyped(selectedInfo.selectedEntity$.value), value).then(setFixedColor);
    };


    return VanillaComponentResolver.CreateInfoSection([
        { left: engine.translate("SelectedInfoPanel.COLOR"), uppercase: true },
        { left: translate("lineViewerEditor.ignorePalette"), right: <VanillaComponentResolver.instance.ToggleField value={isIgnorePalette} onChange={() => onChangeIsIgnorePalette(!isIgnorePalette)} /> },
        ...(isIgnorePalette ? [{ left: translate("lineViewerEditor.lineFixedColor"), right: <VanillaComponentResolver.instance.ColorField value={ColorUtils.toColor01(fixedColor)} onChange={e => onChangeFixedColor(ColorUtils.toRGBHex(e))} /> }] : [])
    ], selectedInfo.useGeneratedTooltipParagraphs(group, tooltipTags, tooltipKeys));
}


