import { PaletteData, PaletteService } from "#service/PaletteService";
import translate from "#utility/translate";
import { ListWithPreviewTab, ColorUtils, VanillaComponentResolver, VanillaFnResolver, Color01, calculateElementPosition, onRecalculateContextMenuPosition, isOnArea, BaseFileService, StringInputDialog, FilePickerDialog, DataProvider, replaceArgs } from "@klyte45/vuio-commons";
import engine from "cohtml/cohtml";
import { useState, useEffect, useRef, useCallback, useMemo, memo, CSSProperties } from "react";
import "./CityPaletteEditor.scss";
import { Portal, ConfirmationDialog } from "cs2/ui";

type ImportPending =
    | { type: 'file'; path: string }
    | { type: 'lib'; palette: PaletteData };

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
 * @param origWidth  Content-box width of the preview container (px)
 * @param origHeight Content-box height of the preview container (px)
 * @param itemCount   Number of colour swatches to display
 * @param remPx       Current root font-size in px
 */
function calcLineIconMultiplier(origWidth: number, origHeight: number, itemCount: number, remPx: number): number {
    const availWidth = origWidth / remPx;
    const availHeight = origHeight / remPx;
    const itemAreaBase = CELL_BASE_REM * CELL_BASE_REM * itemCount;
    const totalArea = availWidth * availHeight;

    const maxMultiplierByArea = Math.floor(Math.sqrt(totalArea / itemAreaBase));
    if (itemCount === 0 || availWidth <= 0 || availHeight <= 0) return DEFAULT_MULTIPLIER;
    for (let m = Math.min(maxMultiplierByArea, MAX_MULTIPLIER); m >= MIN_MULTIPLIER; m--) {
        const cell = CELL_BASE_REM * m;
        const cols = Math.floor(availWidth / cell);
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

    // Dialog states
    const [isAddingPalette, setIsAddingPalette] = useState(false);
    const [isRenamingPalette, setIsRenamingPalette] = useState(false);
    const [isDeletingPalette, setIsDeletingPalette] = useState(false);
    const [isPickingImportFile, setIsPickingImportFile] = useState(false);
    const [palettesFolderPath, setPalettesFolderPath] = useState("");

    // Refs for internal state management
    const skipNextPaletteReset = useRef(false);
    const libraryPalettesCache = useRef<PaletteData[]>([]);
    // Always-current ref so callbacks and effects never capture stale state
    const currentPaletteDataRef = useRef(currentPaletteData);
    currentPaletteDataRef.current = currentPaletteData;

    const generateDataContainer = (folder: string, allowedExtension: string) => BaseFileService.generateDataProvider("k45::xtm", folder, allowedExtension);

    useEffect(() => {
        PaletteService.getPalettesFolderPath().then(setPalettesFolderPath);
    }, []);

    useEffect(() => {
        const observer = new ResizeObserver(([entry]) => {
            if (!entry) return;
            // contentRect already excludes the element's padding
            redrawIcons();
        });
        if (previewRef.current) observer.observe(previewRef.current);
        return () => observer.disconnect();
        // Re-attach on count change: ResizeObserver fires its initial callback after layout
        // is fully settled, which is the correct moment to read clientWidth/clientHeight.
    }, [currentPaletteData?.ColorsRGB?.length]);

    function redrawIcons() {
        const el = previewRef.current;
        if (!el) return;
        const itemCount = currentPaletteDataRef.current?.ColorsRGB?.length ?? 0;
        const fontsize = getComputedStyle(document.documentElement).fontSize;
        const remPx = parseFloat(fontsize) * (
            fontsize.endsWith("vw") ? document.documentElement.clientWidth / 100 :
                fontsize.endsWith("vh") ? document.documentElement.clientHeight / 100 :
                    1
        );
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
        if (skipNextPaletteReset.current) {
            skipNextPaletteReset.current = false;
            return;
        }
        setCurrentPaletteData(availablePalettes?.find(x => x.GuidString === selectedPaletteGuid) ?? void 0);
        setContentChanged(false)
    }, [selectedPaletteGuid, availablePalettes]);


    //list functions
    async function generateDataProviderWithLibrary(folder: string, allowedExtension: string): Promise<DataProvider> {
        if (folder.startsWith("XTM:/")) {
            if (!libraryPalettesCache.current.length) {
                libraryPalettesCache.current = await PaletteService.listDefaultPalettes();
            }
            const subPath = folder.slice("XTM:/".length).replace(/\/$/, "");
            const subParts = subPath === "" ? [] : subPath.split("/");
            const depth = subParts.length;
            const seen = new Set<string>();
            const items: DataProvider = [];
            for (const palette of libraryPalettesCache.current) {
                const parts = palette.Name.split("/");
                if (parts.length <= depth) continue;
                let matches = true;
                for (let i = 0; i < depth; i++) {
                    if (parts[i] !== subParts[i]) { matches = false; break; }
                }
                if (!matches) continue;
                const remaining = parts.slice(depth);
                if (remaining.length === 1) {
                    const fileName = remaining[0] + '.hex';
                    items.push({ displayName: fileName, directory: false, fullPath: "XTM:/" + palette.Name + '.hex' });
                } else {
                    const dirName = remaining[0];
                    if (!seen.has(dirName)) {
                        seen.add(dirName);
                        const dirFullPath = subPath === "" ? "XTM:/" + dirName + "/" : "XTM:/" + subPath + "/" + dirName + "/";
                        items.push({ displayName: dirName, directory: true, fullPath: dirFullPath });
                    }
                }
            }
            return items;
        }
        return generateDataContainer(folder, allowedExtension);
    }

    async function doImportPalette() {
        libraryPalettesCache.current = [];
        setIsPickingImportFile(true);
    }

    async function onImportFileSelected(path?: string) {
        setIsPickingImportFile(false);
        if (!path) return;
        let data: PaletteData | undefined = undefined;
        if (path.startsWith("XTM:/")) {
            const paletteName = path.slice("XTM:/".length).replace(/\.hex$/, "");
            const palette = libraryPalettesCache.current.find(x => x.Name === paletteName);
            if (!palette) return;
            let paletteToSave = { ...palette }
            paletteToSave.Name = paletteToSave.Name.split("/").slice(-1)[0]; // remove any folder structure from the name when importing
            await PaletteService.sendPaletteForCity(paletteToSave.Name, paletteToSave.ColorsRGB);
            data = paletteToSave;
        } else {
            data = await PaletteService.addPaletteFromFile(path);
        }
        if (!data) return;
        const palettes = await PaletteService.listCityPalettes();
        setAvailablePalettes(palettes);
        setSelectedPaletteGuid(data!.GuidString);
    }

    async function doAddNewPalette() {
        setIsAddingPalette(true);
    }

    async function confirmAddNewPalette(name?: string) {
        if (!name?.trim()) return;
        await PaletteService.sendPaletteForCity(name.trim(), ["#FFFFFF"]);
        const palettes = await PaletteService.listCityPalettes();
        setAvailablePalettes(palettes);
        const newPalette = palettes.find(x => x.Name === name.trim());
        if (newPalette) setSelectedPaletteGuid(newPalette.GuidString);
    }

    //palette editing functions
    const onExcludeColor = useCallback((j: number) => {
        setCurrentPaletteData(prev => {
            if (!prev) return prev;
            const newColors = [...prev.ColorsRGB];
            newColors.splice(j, 1);
            return { ...prev, ColorsRGB: newColors } as PaletteData;
        });
        setContentChanged(true);
        // redrawIcons() not needed: the count-change useEffect handles it
    }, []);
    const onMoveColor = useCallback((j: number, delta: number) => {
        setCurrentPaletteData(prev => {
            if (!prev) return prev;
            const newColors = [...prev.ColorsRGB];
            const color = newColors.splice(j, 1);
            newColors.splice(Math.min(Math.max(j + delta, 0), newColors.length), 0, ...color);
            return { ...prev, ColorsRGB: newColors } as PaletteData;
        });
        setContentChanged(true);
    }, []);
    function shuffleColors() {
        setCurrentPaletteData(prev => {
            if (!prev) return prev;
            const newColors = [...prev.ColorsRGB];
            for (let i = newColors.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newColors[i], newColors[j]] = [newColors[j], newColors[i]];
            }
            return { ...prev, ColorsRGB: newColors } as PaletteData;
        });
        setContentChanged(true);
    }
    function addNewColor() {
        setCurrentPaletteData(prev => {
            if (!prev) return prev;
            return { ...prev, ColorsRGB: [...prev.ColorsRGB, "#FFFFFF"] } as PaletteData;
        });
        setContentChanged(true);
        // redrawIcons() not needed: the count-change useEffect handles it
    }
    const onSetColor = useCallback((j: number, newColor: `#${string}`) => {
        setCurrentPaletteData(prev => {
            if (!prev) return prev;
            const newColors = [...prev.ColorsRGB];
            newColors[j] = newColor;
            return { ...prev, ColorsRGB: newColors } as PaletteData;
        });
        setContentChanged(true);
    }, []);
    async function savePalette() {
        setContentChanged(false);
        if (currentPaletteData === undefined) return;
        await PaletteService.updatePalette(currentPaletteData.GuidString, currentPaletteData.Name, currentPaletteData.ColorsRGB);
    }
    async function doDeletePalette() {
        if (!currentPaletteData) return;
        setIsDeletingPalette(true);
    }

    async function confirmDeletePalette(confirmed: boolean) {
        setIsDeletingPalette(false);
        if (!confirmed || !currentPaletteData) return;
        const guid = currentPaletteData.GuidString;
        setSelectedPaletteGuid(undefined);
        await PaletteService.deletePaletteFromCity(guid);
    }

    async function doRenamePalette() {
        if (!currentPaletteData) return;
        setIsRenamingPalette(true);
    }

    async function confirmRenamePalette(newName?: string) {
        setIsRenamingPalette(false);
        if (!newName?.trim() || !currentPaletteData) return;
        const originalPalette = availablePalettes?.find(x => x.GuidString === currentPaletteData.GuidString);
        if (!originalPalette) return;
        const unsavedColors = [...currentPaletteData.ColorsRGB];
        const unsavedChanged = contentChanged;
        const guid = currentPaletteData.GuidString;
        await PaletteService.updatePalette(guid, newName.trim(), originalPalette.ColorsRGB);
        const palettes = await PaletteService.listCityPalettes();
        skipNextPaletteReset.current = true;
        setAvailablePalettes(palettes);
        const renamedPalette = palettes.find(x => x.GuidString === guid);
        if (renamedPalette) {
            setCurrentPaletteData({ ...renamedPalette, ColorsRGB: unsavedColors });
            setContentChanged(unsavedChanged);
        }
    }


    const Dialog = VanillaComponentResolver.instance.Dialog;

    const sortedPaletteItems = useMemo(() =>
        (availablePalettes ? [...availablePalettes].sort((a, b) => a.Name.localeCompare(b.Name)) : [])
            .map(x => ({ value: x.GuidString, displayName: x.Name })),
        [availablePalettes]);

    return <><ListWithPreviewTab className="k45_xtm_paletteEditor" listItems={sortedPaletteItems}
        selectedKey={selectedPaletteGuid ?? null}
        onChangeSelection={setSelectedPaletteGuid}
        detailsFields={[
            { key: "GUID", value: currentPaletteData?.GuidString },
        ]}
        itemActions={[
            { className: "positiveBtn", text: translate("paletteEditor.saveChanges"), action: savePalette, disabled: currentPaletteData === undefined || !contentChanged },
            null,
            { className: "neutralBtn", text: translate("paletteEditor.addColor"), action: addNewColor },
            { className: "neutralBtn", text: translate("paletteEditor.shuffleColors", "Shuffle colors"), action: shuffleColors, disabled: currentPaletteData === undefined || (currentPaletteData.ColorsRGB?.length ?? 0) < 2 },
            { className: "neutralBtn", text: translate("paletteEditor.renamePalette"), action: doRenamePalette, disabled: currentPaletteData === undefined },
            null,
            { className: "negativeBtn", text: translate("paletteEditor.deletePalette"), action: doDeletePalette, disabled: currentPaletteData === undefined },
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
                key={idx} clr={clr} idx={idx} isOpen={editingIndex === idx} onExcludeColor={onExcludeColor}
                onMoveColor={onMoveColor} onSetColor={onSetColor} setEditingIndex={setEditingIndex}
                totalLength={currentPaletteData.ColorsRGB.length}
            />)}
        </div>
    </ListWithPreviewTab>
        <StringInputDialog
            isActive={isAddingPalette}
            setIsActive={setIsAddingPalette}
            dialogTitle={translate("paletteEditor.addPalette.title", "New Palette")}
            dialogPromptText={translate("paletteEditor.addPalette.prompt", "Enter a name for the new palette:")}
            actionOnSuccess={confirmAddNewPalette}
            translate={translate}
        />
        <StringInputDialog
            isActive={isRenamingPalette}
            setIsActive={setIsRenamingPalette}
            dialogTitle={translate("paletteEditor.rename.title", "Rename Palette")}
            dialogPromptText={translate("paletteEditor.rename.prompt", "Enter the new name for the palette:")}
            initialValue={currentPaletteData?.Name}
            actionOnSuccess={confirmRenamePalette}
            translate={translate}
        />
        {isDeletingPalette && <Portal>
            <ConfirmationDialog
                title={translate("paletteEditor.delete.title", "Delete Palette")}
                message={replaceArgs(translate("paletteEditor.delete.message", "Are you sure you want to delete the palette \"{palette}\"? This action cannot be undone."), { palette: currentPaletteData?.Name })}
                onConfirm={() => confirmDeletePalette(true)}
                onCancel={() => confirmDeletePalette(false)}
            />
        </Portal>}
        <FilePickerDialog
            isActive={isPickingImportFile}
            setIsActive={setIsPickingImportFile}
            dialogTitle={translate("paletteEditor.import.title", "Import Palette")}
            dialogPromptText={translate("paletteEditor.import.prompt", "Select a .hex palette file to import:")}
            allowedExtensions="*.hex"
            initialFolder={palettesFolderPath}
            generateDataProvider={generateDataProviderWithLibrary}
            bookmarks={[{ name: translate("paletteEditor.import.libraryBookmark", "XTM: Library"), targetPath: "XTM:/" }]}
            bookmarksTitle={translate("paletteEditor.import.bookmarksTitle", "Library")}
            actionOnSuccess={onImportFileSelected}
            translate={translate}
        />
    </>;
}




type PropsIcon = {
    clr: `#${string}`;
    idx: number;
    isOpen: boolean;
    totalLength: number;
    onExcludeColor: (index: number) => void;
    onMoveColor: (index: number, direction: number) => void;
    onSetColor: (index: number, color: `#${string}`) => void;
    setEditingIndex: (index: number) => void;
};

const LineIconWithEditor = memo(({ clr, idx, isOpen, onExcludeColor, onMoveColor, onSetColor, setEditingIndex, totalLength }: PropsIcon) => {

    const iconRef = useRef(null as any as HTMLDivElement);
    const pickerRef = useRef(null as any as HTMLDivElement);
    const [menuCss, setMenuCss] = useState({} as CSSProperties)

    const ColorPicker = VanillaComponentResolver.instance.ColorPicker;
    const noFocus = VanillaComponentResolver.instance.FOCUS_DISABLED;
    const VanillaColorUtils = VanillaFnResolver.instance.color;

    useEffect(() => {
        if (!isOpen) return;
        setMenuCss(onRecalculateContextMenuPosition(iconRef, calculateElementPosition(iconRef.current)));
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (!iconRef.current) return;
            if (isOnArea(event, iconRef)) return;
            if (!pickerRef.current) return;
            if (isOnArea(event, pickerRef)) return;
            setEditingIndex(undefined!);
        };
        document.addEventListener('mousedown', handleClickOutside, true);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside, true);
        };
    }, [isOpen]);

    return <div className={"lineIconContainer" + (isOpen ? " currentSelected" : "")} key={idx} ref={iconRef}>
        <div className="lineIcon" style={{ "--lineColor": clr, "--contrastColor": ColorUtils.toRGBA(ColorUtils.getContrastColorFor(ColorUtils.toColor01(clr))) } as CSSProperties} onClick={() => setEditingIndex(idx)}>
            <div className={`routeNum singleLine chars${(idx + 1)?.toString().length}`}> {idx + 1}</div>
        </div>
        <div className="excludeBtn" onClick={() => onExcludeColor(idx)}>X</div>
        {idx > 0 && <div className="moveMinus" onClick={(x) => onMoveColor(idx, x.shiftKey ? -Infinity : -1)}>⇚</div>}
        {idx < totalLength - 1 && <div className="movePlus" onClick={(x) => onMoveColor(idx, x.shiftKey ? Infinity : 1)}>⇛</div>}
        {isOpen &&
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
});
