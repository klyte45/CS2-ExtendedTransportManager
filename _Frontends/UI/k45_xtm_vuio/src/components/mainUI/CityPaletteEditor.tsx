import { PaletteData, PaletteService } from "#service/PaletteService";
import translate from "#utility/translate";
import { ListWithPreviewTab, ColorUtils } from "@klyte45/vuio-commons";
import engine from "cohtml/cohtml";
import { useState, useEffect, CSSProperties } from "react";
import { Mutable } from "./XtmMainPanel";

export function CityPaletteEditor(args: any) {
    //list states
    const [availablePalettes, setAvailablePalettes] = useState<PaletteData[]>();
    const [selectedPaletteGuid, setSelectedPaletteGuid] = useState<string>();

    //editing states
    const [currentPaletteData, setCurrentPaletteData] = useState<PaletteData>();
    const [editingIndex, setEditingIndex] = useState<number>();
    const [contentChanged, setContentChanged] = useState(false);

    async function updatePalettes() {

        const palettesSaved = await PaletteService.listCityPalettes();
        setAvailablePalettes(palettesSaved);
    }
    useEffect(() => {
        engine.whenReady.then(async () => {
            PaletteService.doOnCityPalettesUpdated(() => updatePalettes());
        });
        updatePalettes();
        return () => PaletteService.undoOnCityPalettesUpdated();
    }, []);

    useEffect(() => {
        setCurrentPaletteData(availablePalettes?.find(x => x.GuidString === selectedPaletteGuid) ?? void 0);
        setContentChanged(false)
    }, [selectedPaletteGuid, availablePalettes]);


    //list functions
    async function doImportPalette() {
        //need file picker and modal for confirmation showing the palette being imported
    }

    async function doAddNewPalette() {
        //need modal for entering name and showing the new palette being edited
    }

    //palette editing functions
    function onExcludeColor(j: number): void {
        if (j === undefined) return;
        let editingPaletteData = { ...currentPaletteData } as PaletteData;
        editingPaletteData.ColorsRGB!.splice(j, 1);
        setCurrentPaletteData(editingPaletteData);
        setContentChanged(true);
    }
    function onMoveColor(j: number, delta: number): void {
        let editingPaletteData = { ...currentPaletteData } as PaletteData;
        var color = editingPaletteData.ColorsRGB!.splice(j, 1);
        editingPaletteData.ColorsRGB!.splice(Math.min(Math.max(j + delta, 0), editingPaletteData.ColorsRGB!.length), 0, ...color);
        setCurrentPaletteData(editingPaletteData);
        setContentChanged(true);
    }
    function addNewColor() {
        let editingPaletteData = { ...currentPaletteData } as PaletteData;
        editingPaletteData.ColorsRGB!.push("#FFFFFF");
        setCurrentPaletteData(editingPaletteData);
        setContentChanged(true);
    }
    async function savePalette() {
        if (currentPaletteData === undefined) return;
        setContentChanged(false);
        await PaletteService.updatePalette(currentPaletteData.GuidString, currentPaletteData.Name, currentPaletteData.ColorsRGB);
    }
    async function doDeletePalette(x: PaletteData) {
        //need modal for confirmation
    }


    return <ListWithPreviewTab className="k45_xtm_paletteEditor" listItems={availablePalettes?.sort((a, b) => a.Name.localeCompare(b.Name)).map(x => ({
        value: x.GuidString,
        displayName: x.Name,
    })) ?? []}
        selectedKey={selectedPaletteGuid ?? null}
        onChangeSelection={setSelectedPaletteGuid}
        detailsFields={[
            { key: "GUID", value: currentPaletteData?.GuidString },
            { key: "Source", value: currentPaletteData?.Name },
        ]}
        itemActions={[
            { className: "positiveBtn", text: "Delete Palette", action: () => doDeletePalette(currentPaletteData!), disabled: currentPaletteData === undefined },
            null,
            { className: "negativeBtn", text: "Add Color", action: addNewColor },
            { className: "positiveBtn", text: "Save Changes", action: savePalette, disabled: currentPaletteData === undefined || !contentChanged },
        ]}
        listActions={[
            { isContext: false, src: "coui://uil/Standard/Plus.svg", onSelect: doImportPalette }
        ]}
        emptyListMsg={translate("paletteEditor.noPalettes")}
        noneSelectedMsg={translate("paletteEditor.noPaletteSelected")}

    >{currentPaletteData && currentPaletteData.ColorsRGB.map((clr, j) => <div className={"lineIconContainer " + (j == editingIndex ? "currentSelected" : "")} key={j}>
        <div className="lineIcon" style={{ "--lineColor": clr, "--contrastColor": ColorUtils.toRGBA(ColorUtils.getContrastColorFor(ColorUtils.toColor01(clr))) } as CSSProperties} onClick={() => setEditingIndex(j)}>
            <div className={`routeNum singleLine chars${(j + 1)?.toString().length}`}> {j + 1}</div>
        </div>
        <div className="excludeBtn" onClick={() => onExcludeColor(j)}>X</div>
        {j > 0 && <div className="moveMinus" onClick={(x) => onMoveColor(j, x.shiftKey ? -Infinity : -1)}>⇚</div>}
        {j < currentPaletteData.ColorsRGB.length - 1 && <div className="movePlus" onClick={(x) => onMoveColor(j, x.shiftKey ? Infinity : 1)}>⇛</div>}
    </div>
    )}</ListWithPreviewTab>;
}
