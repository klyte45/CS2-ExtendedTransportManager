import { PaletteData, PaletteService } from "#service/PaletteService";
import translate from "#utility/translate";
import { ListWithPreviewTab, ColorUtils } from "@klyte45/vuio-commons";
import engine from "cohtml/cohtml";
import { useState, useEffect, useRef, CSSProperties } from "react";
import "./CityPaletteEditor.scss";

// Constants mirrored from CityPaletteEditor.scss (keep in sync manually):
//   lineIconContainer  width/height = 4rem * M,  margin = 0.25rem * M each side
//   => total cell footprint = (4 + 0.25 + 0.25) = 4.5rem  per multiplier unit, both axes
const CELL_BASE_REM = 4.55;
const MAX_MULTIPLIER = 30;
const MIN_MULTIPLIER = 1;
const DEFAULT_MULTIPLIER = 3;

/**
 * Computes the largest integer multiplier so that every colour swatch fits
 * inside the preview area without overflow (flex-wrap row layout).
 * @param availWidth  Content-box width of the preview container (px)
 * @param availHeight Content-box height of the preview container (px)
 * @param itemCount   Number of colour swatches to display
 * @param remPx       Current root font-size in px
 */
function calcLineIconMultiplier(availWidth: number, availHeight: number, itemCount: number, remPx: number): number {
    const itemAreaBase = CELL_BASE_REM * CELL_BASE_REM * itemCount * remPx * remPx;
    const totalArea = availWidth * availHeight;
    console.log(`Calculating line icon multiplier: availWidth=${availWidth}px, availHeight=${availHeight}px, itemCount=${itemCount}, remPx=${remPx}px, itemAreaBase=${itemAreaBase}px², totalArea=${totalArea}px²`);

    const maxMultiplierByArea = Math.floor(Math.sqrt(totalArea / itemAreaBase));
    console.log(`Max multiplier by area: ${maxMultiplierByArea}`);

    if (itemCount === 0 || availWidth <= 0 || availHeight <= 0) return DEFAULT_MULTIPLIER;
    for (let m = Math.min(maxMultiplierByArea, MAX_MULTIPLIER); m >= MIN_MULTIPLIER; m--) {
        const cell = CELL_BASE_REM * m * remPx;
        const cols = Math.floor(availWidth / cell);
        console.log(`Trying multiplier ${m}: cell=${cell}px, cols=${cols}, rowsNeeded=${Math.ceil(itemCount / cols)},availWidth=${availWidth}px, availHeight=${availHeight}px (i=${itemCount}, remPx=${remPx})`);
        if (cols === 0) continue;
        const rowsNeeded = Math.ceil(itemCount / cols);
        if (rowsNeeded <= Math.floor(availHeight / cell)) return m;
    }
    return MIN_MULTIPLIER;
}

export function CityPaletteEditor(args: any) {
    //list states
    const [availablePalettes, setAvailablePalettes] = useState<PaletteData[]>();
    const [selectedPaletteGuid, setSelectedPaletteGuid] = useState<string>();

    //editing states
    const [currentPaletteData, setCurrentPaletteData] = useState<PaletteData>();
    const [editingIndex, setEditingIndex] = useState<number>();
    const [contentChanged, setContentChanged] = useState(false);

    // Auto-sizing for colour swatches
    const previewRef = useRef<HTMLDivElement>(null);
    const [lineIconMultiplier, setLineIconMultiplier] = useState(DEFAULT_MULTIPLIER);

    useEffect(() => {
        ;
        const observer = new ResizeObserver(([entry]) => {
            if (!entry) return;
            // contentRect already excludes the element's padding
            const { width, height } = entry.contentRect;
            redrawIcons();
        });
        previewRef.current && observer.observe(previewRef.current);
        return () => observer.disconnect();
    }, [currentPaletteData?.ColorsRGB?.length]);

    function redrawIcons() {
        const el = previewRef.current;
        if (!el) return;
        const itemCount = currentPaletteData?.ColorsRGB?.length ?? 0
        const fontsize = getComputedStyle(document.documentElement).fontSize;
        const remPx = parseFloat(fontsize) * (fontsize.endsWith("vh") ? document.documentElement.clientHeight / 100 : 1);
        setLineIconMultiplier(calcLineIconMultiplier(el.clientWidth, el.clientHeight, itemCount, remPx));
    }

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
        redrawIcons();
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
        redrawIcons();
    }
    async function savePalette() {
        setContentChanged(false);
        if (currentPaletteData === undefined) return;
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
        ]}
        itemActions={[
            { className: "positiveBtn", text: "Save Changes", action: savePalette, disabled: currentPaletteData === undefined || !contentChanged },
            { className: "positiveBtn", text: "Add Color", action: addNewColor },
            null,
            { className: "negativeBtn", text: "Delete Palette", action: () => doDeletePalette(currentPaletteData!), disabled: currentPaletteData === undefined },
        ]}
        listActions={[
            { isContext: false, src: "coui://uil/Standard/Plus.svg", onSelect: doImportPalette }
        ]}
        emptyListMsg={translate("paletteEditor.noPalettes")}
        noneSelectedMsg={translate("paletteEditor.noPaletteSelected")}
        previewRef={previewRef}

    ><div style={{ "--lineIconSizeMultiplier": lineIconMultiplier, display: "flex", flexWrap: "wrap", flexDirection: "row", maxHeight: "100%" } as CSSProperties}>{currentPaletteData && currentPaletteData.ColorsRGB.map((clr, j) => <div className={"lineIconContainer " + (j == editingIndex ? "currentSelected" : "")} key={j}>
        <div className="lineIcon" style={{ "--lineColor": clr, "--contrastColor": ColorUtils.toRGBA(ColorUtils.getContrastColorFor(ColorUtils.toColor01(clr))) } as CSSProperties} onClick={() => setEditingIndex(j)}>
            <div className={`routeNum singleLine chars${(j + 1)?.toString().length}`}> {j + 1}</div>
        </div>
        <div className="excludeBtn" onClick={() => onExcludeColor(j)}>X</div>
        {j > 0 && <div className="moveMinus" onClick={(x) => onMoveColor(j, x.shiftKey ? -Infinity : -1)}>⇚</div>}
        {j < currentPaletteData.ColorsRGB.length - 1 && <div className="movePlus" onClick={(x) => onMoveColor(j, x.shiftKey ? Infinity : 1)}>⇛</div>}
    </div>
    )}
        </div></ListWithPreviewTab>;
}
