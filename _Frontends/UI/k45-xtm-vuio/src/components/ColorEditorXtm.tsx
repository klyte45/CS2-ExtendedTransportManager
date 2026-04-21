import { LineManagementService } from "#service/LineManagementService";
import translate from "#utility/translate";
import { toEntityTyped, ColorUtils, VanillaComponentResolver } from "@klyte45/vuio-commons";
import engine from "cohtml/cohtml";
import { trigger, useValue } from "cs2/api";
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
    const selectedEntity = useValue(selectedInfo.selectedEntity$);

    useEffect(() => {
        LineManagementService.getIgnorePalette(toEntityTyped(selectedEntity)).then(setIsIgnorePalette);
        LineManagementService.getRouteFixedColor(toEntityTyped(selectedEntity)).then(setFixedColor);
    }, [selectedEntity.index]);

    const onChangeIsIgnorePalette = (value: boolean) => LineManagementService.setIgnorePalette(toEntityTyped(selectedEntity), value).then(setIsIgnorePalette);
    const onChangeFixedColor = (value: string) => {
        trigger("ColorSection", "setColor", { ...ColorUtils.toColor01(value), __Type: "Game.UI.Common.UIColor" });
        LineManagementService.setRouteFixedColor(toEntityTyped(selectedEntity), value).then(setFixedColor);
    };


    return VanillaComponentResolver.CreateInfoSection([
        { left: engine.translate("SelectedInfoPanel.COLOR"), uppercase: true },
        { left: translate("lineViewerEditor.ignorePalette"), right: <VanillaComponentResolver.instance.ToggleField value={isIgnorePalette} onChange={() => onChangeIsIgnorePalette(!isIgnorePalette)} /> },
        ...(isIgnorePalette ? [{ left: translate("lineViewerEditor.lineFixedColor"), right: <VanillaComponentResolver.instance.ColorField hexInput value={ColorUtils.toColor01(fixedColor)} onChange={e => onChangeFixedColor(ColorUtils.toRGBHex(e))} /> }] : [])
    ], selectedInfo.useGeneratedTooltipParagraphs(group, tooltipTags, tooltipKeys));
}


