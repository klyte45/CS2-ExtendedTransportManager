import { LineManagementService } from "#service/LineManagementService";
import { requestXtmLineMapRefresh } from "#utility/xtmLineMapRefresh";
import translate from "#utility/translate";
import { toEntityTyped, ColorUtils, VanillaComponentResolver } from "@klyte45/vuio-commons";
import engine from "cohtml/cohtml";
import { trigger, useValue } from "cs2/api";
import { selectedInfo } from "cs2/bindings";
import { useState, useEffect, useRef } from "react";

type Props = {
    group: string;
    tooltipTags: string[];
    tooltipKeys: string[];
};

export const ColorEditorXtm = ({ group, tooltipTags, tooltipKeys }: Props) => {
    const [isIgnorePalette, setIsIgnorePalette] = useState(false);
    const [fixedColor, setFixedColor] = useState("#ffffff");
    const selectedEntity = useValue(selectedInfo.selectedEntity$);
    const colorRefreshTimer = useRef(0);

    useEffect(() => {
        LineManagementService.getIgnorePalette(toEntityTyped(selectedEntity)).then(setIsIgnorePalette);
        LineManagementService.getRouteFixedColor(toEntityTyped(selectedEntity)).then(setFixedColor);
    }, [selectedEntity.index]);

    useEffect(() => () => {
        if (colorRefreshTimer.current) window.clearTimeout(colorRefreshTimer.current);
    }, []);

    const scheduleMapRefresh = () => {
        if (colorRefreshTimer.current) window.clearTimeout(colorRefreshTimer.current);
        colorRefreshTimer.current = window.setTimeout(() => {
            colorRefreshTimer.current = 0;
            requestXtmLineMapRefresh();
        }, 350);
    };

    const onChangeIsIgnorePalette = (value: boolean) => {
        LineManagementService.setIgnorePalette(toEntityTyped(selectedEntity), value).then((next) => {
            setIsIgnorePalette(next);
            requestXtmLineMapRefresh();
        });
    };

    const onChangeFixedColor = (value: string) => {
        trigger("ColorSection", "setColor", { ...ColorUtils.toColor01(value), __Type: "Game.UI.Common.UIColor" });
        LineManagementService.setRouteFixedColor(toEntityTyped(selectedEntity), value).then((next) => {
            setFixedColor(next);
            scheduleMapRefresh();
        });
    };

    return VanillaComponentResolver.CreateInfoSection([
        { left: engine.translate("SelectedInfoPanel.COLOR"), uppercase: true },
        {
            left: translate("lineViewerEditor.ignorePalette", "Use fixed color"),
            tooltip: translate("lineViewerEditor.ignorePalette.tooltip", "Ignore palette's settings for this line"),
            right: <VanillaComponentResolver.instance.ToggleField
                value={isIgnorePalette}
                onChange={() => onChangeIsIgnorePalette(!isIgnorePalette)}
            />,
        },
        ...(isIgnorePalette ? [{
            left: translate("lineViewerEditor.lineFixedColor"),
            right: <VanillaComponentResolver.instance.ColorField
                hexInput
                value={ColorUtils.toColor01(fixedColor)}
                onChange={(e) => onChangeFixedColor(ColorUtils.toRGBHex(e))}
            />,
        }] : []),
    ], selectedInfo.useGeneratedTooltipParagraphs(group, tooltipTags, tooltipKeys));
};
