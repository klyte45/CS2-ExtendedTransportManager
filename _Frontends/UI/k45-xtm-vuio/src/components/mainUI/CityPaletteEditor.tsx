import { PaletteData, PaletteService } from "#service/PaletteService";
import translate from "#utility/translate";
import { ListWithPreviewTab, ColorUtils, VanillaComponentResolver, VanillaFnResolver, Color01, calculateElementPosition, onRecalculateContextMenuPosition, isOnArea } from "@klyte45/vuio-commons";
import engine from "cohtml/cohtml";
import { useState, useEffect, useRef, CSSProperties } from "react";
import "./CityPaletteEditor.scss";
import { Portal } from "cs2/ui";

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
    function onSetColor(j: number, newColor: `#${string}`): void {
        let editingPaletteData = { ...currentPaletteData } as PaletteData;
        editingPaletteData.ColorsRGB![j] = newColor;
        setCurrentPaletteData(editingPaletteData);
        setContentChanged(true);
    }
    async function savePalette() {
        setContentChanged(false);
        if (currentPaletteData === undefined) return;
        await PaletteService.updatePalette(currentPaletteData.GuidString, currentPaletteData.Name, currentPaletteData.ColorsRGB);
    }
    async function doDeletePalette(x: PaletteData) {
        //need modal for confirmation
    }
    async function doRenamePalette(x: PaletteData) {
        //need modal for input new name
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
            { className: "positiveBtn", text: translate("paletteEditor.saveChanges"), action: savePalette, disabled: currentPaletteData === undefined || !contentChanged },
            { className: "positiveBtn", text: translate("paletteEditor.addColor"), action: addNewColor },
            null,
            { className: "negativeBtn", text: translate("paletteEditor.deletePalette"), action: () => doDeletePalette(currentPaletteData!), disabled: currentPaletteData === undefined },
        ]}
        listActions={[
            { isContext: false, src: "coui://uil/Standard/Plus.svg", onSelect: doAddNewPalette, tooltip: translate("paletteEditor.addNewPalette") },
            { isContext: false, src: "coui://uil/Standard/Folder.svg", onSelect: doImportPalette, tooltip: translate("paletteEditor.importPalette") },
        ]}
        emptyListMsg={translate("paletteEditor.noPalettes")}
        noneSelectedMsg={translate("paletteEditor.noPaletteSelected")}
        previewRef={previewRef}

    >
        <div style={{ "--lineIconSizeMultiplier": lineIconMultiplier, display: "flex", flexWrap: "wrap", flexDirection: "row", maxHeight: "100%" } as CSSProperties}>
            {currentPaletteData && currentPaletteData.ColorsRGB.map((clr, idx) => <LineIconWithEditor
                key={idx} clr={clr} idx={idx} editingIndex={editingIndex} onExcludeColor={onExcludeColor}
                onMoveColor={onMoveColor} onSetColor={onSetColor} setEditingIndex={setEditingIndex}
                totalLength={currentPaletteData.ColorsRGB.length}
            />)}
        </div>
    </ListWithPreviewTab>;
}




type PropsIcon = {
    clr: `#${string}`;
    idx: number;
    editingIndex?: number;
    totalLength: number;
    onExcludeColor: (index: number) => void;
    onMoveColor: (index: number, direction: number) => void;
    onSetColor: (index: number, color: `#${string}`) => void;
    setEditingIndex: (index: number) => void;
};

const LineIconWithEditor = ({ clr, idx, editingIndex, onExcludeColor, onMoveColor, onSetColor, setEditingIndex, totalLength }: PropsIcon) => {

    const iconRef = useRef(null as any as HTMLDivElement);
    const pickerRef = useRef(null as any as HTMLDivElement);
    const [menuCss, setMenuCss] = useState({} as CSSProperties)

    const ColorPicker = VanillaComponentResolver.instance.ColorPicker;
    const noFocus = VanillaComponentResolver.instance.FOCUS_DISABLED;
    const VanillaColorUtils = VanillaFnResolver.instance.color;

    const iconPosition = calculateElementPosition(iconRef.current);


    useEffect(() => {
        setMenuCss(onRecalculateContextMenuPosition(iconRef, iconPosition));
    }, [editingIndex === idx])

    const handleClickOutside = (event: MouseEvent) => {
        if (!iconRef.current) return;
        if (isOnArea(event, iconRef)) return;
        if (!pickerRef.current) return;
        if (isOnArea(event, pickerRef)) return;
        setEditingIndex(undefined!);
    };


    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside, true);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside, true);
        };
    }, []);

    return <div className={"lineIconContainer " + (idx == editingIndex ? "currentSelected" : "")} key={idx} ref={iconRef}>
        <div className="lineIcon" style={{ "--lineColor": clr, "--contrastColor": ColorUtils.toRGBA(ColorUtils.getContrastColorFor(ColorUtils.toColor01(clr))) } as CSSProperties} onClick={() => setEditingIndex(idx)}>
            <div className={`routeNum singleLine chars${(idx + 1)?.toString().length}`}> {idx + 1}</div>
        </div>
        <div className="excludeBtn" onClick={() => onExcludeColor(idx)}>X</div>
        {idx > 0 && <div className="moveMinus" onClick={(x) => onMoveColor(idx, x.shiftKey ? -Infinity : -1)}>⇚</div>}
        {idx < totalLength - 1 && <div className="movePlus" onClick={(x) => onMoveColor(idx, x.shiftKey ? Infinity : 1)}>⇛</div>}
        {editingIndex === idx &&
            <Portal>
                <div ref={pickerRef} style={menuCss} className="k45_comm_contextMenu k45_xtm_colorPickerOverlay">
                    <ColorPicker alpha={false} focusKey={noFocus} preview="None"
                        color={VanillaColorUtils.rgbaToHsva(ColorUtils.toColor01(clr))}
                        onChange={x => onSetColor(idx, ColorUtils.toRGBHex(VanillaColorUtils.hsvaToRgba(x)))}
                        hexInput colorWheel sliderTextInput />
                </div>
            </Portal>
        }
    </div>
}