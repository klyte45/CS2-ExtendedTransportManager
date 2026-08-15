import { PaletteData, PaletteService } from "#service/PaletteService";
import translate from "#utility/translate";
import pasteAppendIcon from "#images/i_palettePasteAppend.svg";
import pasteReplaceIcon from "#images/i_palettePasteReplace.svg";
import {
    calculateElementPosition,
    ColorUtils,
    FilePickerDialog,
    isOnArea,
    onRecalculateContextMenuPosition,
    replaceArgs,
    StringInputDialog,
    VanillaComponentResolver,
    VanillaFnResolver,
} from "@klyte45/vuio-commons";
import { FocusDisabled } from "cs2/input";
import { ConfirmationDialog, Portal } from "cs2/ui";
import {
    CSSProperties,
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    createPaletteFileItemPresentation,
    generatePaletteDataProviderWithLibrary,
    resolvePaletteFileColors,
} from "./paletteFilePickerUtils";

const PLUS_ICON = "coui://uil/Standard/Plus.svg";
const DICE_ICON = "coui://uil/Standard/Dice.svg";
const PENCIL_ICON = "coui://uil/Standard/PencilPaper.svg";
const APPEND_ICON = "coui://uil/Standard/PaperWithArrow.svg";
const COPY_ICON = "coui://uil/Standard/RectangleCopy.svg";
const RESET_ICON = "coui://uil/Standard/Reset.svg";
const PASTE_REPLACE_ICON = pasteReplaceIcon;
const PASTE_APPEND_ICON = pasteAppendIcon;

const CELL_BASE_REM = 4.55;
const MAX_MULTIPLIER = 30;
const MIN_MULTIPLIER = 1;
const DEFAULT_MULTIPLIER = 3;
const DRAG_THRESHOLD_PX = 4;
const ACTION_STATUS_MS = 5000;
const HEX_COLOR_LINE = /^#?[a-fA-F0-9]{6}$/;
const MAX_PALETTE_COLORS = 500;

function sequentialDisplayNumbers(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i + 1);
}

function nextDisplayNumber(labels: number[]): number {
    return (labels.length ? Math.max(...labels) : 0) + 1;
}

function takePaletteColors(
    colors: `#${string}`[],
    currentLength = 0,
): `#${string}`[] {
    const room = Math.max(0, MAX_PALETTE_COLORS - currentLength);
    return colors.slice(0, room);
}

function parseHexPaletteClipboard(text: string): `#${string}`[] | null {
    const colors = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => HEX_COLOR_LINE.test(line))
        .map((line) => (line.startsWith("#") ? line : `#${line}`) as `#${string}`);
    return colors.length > 0 ? colors : null;
}

function calcLineIconMultiplier(
    origWidth: number,
    origHeight: number,
    itemCount: number,
    remPx: number,
): number {
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

type Props = {
    availablePalettes: PaletteData[];
    selectedPaletteGuid: string | null;
    onPalettesUpdated: (palettes: PaletteData[], selectGuid?: string | null) => void;
};

export function PaletteEditorPanel({
    availablePalettes,
    selectedPaletteGuid,
    onPalettesUpdated,
}: Props) {
    const [currentPaletteData, setCurrentPaletteData] = useState<PaletteData>();
    const [displayNumbers, setDisplayNumbers] = useState<number[]>([]);
    const [editingIndex, setEditingIndex] = useState<number>();
    const [contentChanged, setContentChanged] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);
    const [lineIconMultiplier, setLineIconMultiplier] = useState(DEFAULT_MULTIPLIER);
    const [isRenamingPalette, setIsRenamingPalette] = useState(false);
    const [isDeletingPalette, setIsDeletingPalette] = useState(false);
    const [isResettingPalette, setIsResettingPalette] = useState(false);
    const [isPickingAppendFile, setIsPickingAppendFile] = useState(false);
    const [palettesFolderPath, setPalettesFolderPath] = useState("");
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [dropIndex, setDropIndex] = useState<number | null>(null);
    const [actionStatus, setActionStatus] = useState<string | null>(null);
    const libraryPalettesCache = useRef<PaletteData[]>([]);
    const skipNextPaletteReset = useRef(false);
    const currentPaletteDataRef = useRef(currentPaletteData);
    currentPaletteDataRef.current = currentPaletteData;
    const dragCandidateRef = useRef<{ idx: number; x: number; y: number } | null>(null);
    const draggingIndexRef = useRef<number | null>(null);
    const dropIndexRef = useRef<number | null>(null);
    const suppressClickRef = useRef(false);
    const actionStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    draggingIndexRef.current = draggingIndex;
    dropIndexRef.current = dropIndex;

    const showActionStatus = useCallback((msg: string, ms = ACTION_STATUS_MS) => {
        if (actionStatusTimerRef.current) {
            clearTimeout(actionStatusTimerRef.current);
            actionStatusTimerRef.current = null;
        }
        setActionStatus(msg);
        actionStatusTimerRef.current = setTimeout(() => {
            setActionStatus(null);
            actionStatusTimerRef.current = null;
        }, ms);
    }, []);

    useEffect(() => {
        return () => {
            if (actionStatusTimerRef.current) clearTimeout(actionStatusTimerRef.current);
        };
    }, []);

    useEffect(() => {
        PaletteService.getPalettesFolderPath().then(setPalettesFolderPath);
    }, []);

    useEffect(() => {
        const observer = new ResizeObserver(() => redrawIcons());
        if (previewRef.current) observer.observe(previewRef.current);
        return () => observer.disconnect();
    }, [currentPaletteData?.ColorsRGB?.length]);

    function redrawIcons() {
        const el = previewRef.current;
        if (!el) return;
        const itemCount = currentPaletteDataRef.current?.ColorsRGB?.length ?? 0;
        const fontsize = getComputedStyle(document.documentElement).fontSize;
        const remPx =
            parseFloat(fontsize) *
            (fontsize.endsWith("vw")
                ? document.documentElement.clientWidth / 100
                : fontsize.endsWith("vh")
                  ? document.documentElement.clientHeight / 100
                  : 1);
        setLineIconMultiplier(
            calcLineIconMultiplier(el.clientWidth, el.clientHeight, itemCount, remPx),
        );
    }

    useEffect(() => {
        if (skipNextPaletteReset.current) {
            skipNextPaletteReset.current = false;
            return;
        }
        const palette =
            availablePalettes.find((x) => x.GuidString === selectedPaletteGuid) ?? undefined;
        setCurrentPaletteData(palette);
        setDisplayNumbers(
            palette ? sequentialDisplayNumbers(palette.ColorsRGB?.length ?? 0) : [],
        );
        setContentChanged(false);
        setEditingIndex(undefined);
        setDraggingIndex(null);
        setDropIndex(null);
        dragCandidateRef.current = null;
    }, [selectedPaletteGuid, availablePalettes]);

    const onExcludeColor = useCallback((j: number) => {
        setCurrentPaletteData((prev) => {
            if (!prev) return prev;
            const newColors = [...prev.ColorsRGB];
            newColors.splice(j, 1);
            return { ...prev, ColorsRGB: newColors } as PaletteData;
        });
        setDisplayNumbers((prev) => {
            const next = [...prev];
            next.splice(j, 1);
            return next;
        });
        setContentChanged(true);
    }, []);

    const reorderColor = useCallback((from: number, to: number) => {
        if (from === to) return;
        setCurrentPaletteData((prev) => {
            if (!prev) return prev;
            const newColors = [...prev.ColorsRGB];
            const [color] = newColors.splice(from, 1);
            newColors.splice(to, 0, color);
            return { ...prev, ColorsRGB: newColors } as PaletteData;
        });
        setDisplayNumbers((prev) => {
            const next = [...prev];
            const [label] = next.splice(from, 1);
            next.splice(to, 0, label);
            return next;
        });
        setContentChanged(true);
    }, []);

    const beginDragCandidate = useCallback((idx: number, x: number, y: number) => {
        dragCandidateRef.current = { idx, x, y };
    }, []);

    const setDropTarget = useCallback((idx: number) => {
        if (draggingIndexRef.current === null) return;
        setDropIndex(idx);
    }, []);

    const handleIconClick = useCallback((idx: number) => {
        if (suppressClickRef.current) {
            suppressClickRef.current = false;
            return;
        }
        setEditingIndex(idx);
    }, []);

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            const candidate = dragCandidateRef.current;
            if (!candidate) return;
            if (draggingIndexRef.current !== null) return;
            const dx = e.clientX - candidate.x;
            const dy = e.clientY - candidate.y;
            if (dx * dx + dy * dy < DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) return;
            setDraggingIndex(candidate.idx);
            setDropIndex(candidate.idx);
            setEditingIndex(undefined);
        };
        const onUp = () => {
            const from = draggingIndexRef.current;
            const to = dropIndexRef.current;
            const wasDragging = from !== null;
            dragCandidateRef.current = null;
            if (!wasDragging) return;
            suppressClickRef.current = true;
            if (from !== null && to !== null && from !== to) {
                reorderColor(from, to);
            }
            setDraggingIndex(null);
            setDropIndex(null);
        };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
        return () => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        };
    }, [reorderColor]);

    function shuffleColors() {
        if (!currentPaletteData) return;
        const newColors = [...currentPaletteData.ColorsRGB];
        const newLabels = [...displayNumbers];
        for (let i = newColors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newColors[i], newColors[j]] = [newColors[j], newColors[i]];
            [newLabels[i], newLabels[j]] = [newLabels[j], newLabels[i]];
        }
        setCurrentPaletteData({ ...currentPaletteData, ColorsRGB: newColors } as PaletteData);
        setDisplayNumbers(newLabels);
        setContentChanged(true);
    }

    function addNewColor() {
        const current = currentPaletteDataRef.current;
        if (!current || current.ColorsRGB.length >= MAX_PALETTE_COLORS) return;
        setCurrentPaletteData((prev) => {
            if (!prev || prev.ColorsRGB.length >= MAX_PALETTE_COLORS) return prev;
            return { ...prev, ColorsRGB: [...prev.ColorsRGB, "#FFFFFF"] } as PaletteData;
        });
        setDisplayNumbers((prev) => {
            if (prev.length >= MAX_PALETTE_COLORS) return prev;
            return [...prev, nextDisplayNumber(prev)];
        });
        setContentChanged(true);
    }

    const openAppendPicker = () => {
        libraryPalettesCache.current = [];
        setIsPickingAppendFile(true);
    };

    const generateDataProviderWithLibrary = useCallback(
        (folder: string, allowedExtension: string) =>
            generatePaletteDataProviderWithLibrary(folder, allowedExtension, libraryPalettesCache),
        [],
    );

    const resolveFileItemPresentation = useMemo(
        () => createPaletteFileItemPresentation(libraryPalettesCache),
        [],
    );

    async function onAppendFileSelected(path?: string) {
        setIsPickingAppendFile(false);
        if (!path) return;
        const colors = await resolvePaletteFileColors(path, libraryPalettesCache);
        if (!colors?.length) return;
        const appended = takePaletteColors(
            colors as `#${string}`[],
            currentPaletteDataRef.current?.ColorsRGB?.length ?? 0,
        );
        if (!appended.length) return;
        setCurrentPaletteData((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                ColorsRGB: [...prev.ColorsRGB, ...takePaletteColors(appended, prev.ColorsRGB.length)],
            } as PaletteData;
        });
        setDisplayNumbers((prev) => {
            const kept = takePaletteColors(appended, prev.length);
            let next = nextDisplayNumber(prev);
            const labels = kept.map(() => next++);
            return [...prev, ...labels];
        });
        setContentChanged(true);
    }

    async function copyPalette() {
        if (!currentPaletteData?.ColorsRGB?.length) return;
        const text = currentPaletteData.ColorsRGB.join("\n");
        try {
            const ok = await PaletteService.setClipboardText(text);
            if (ok) {
                showActionStatus(
                    translate("paletteEditor.clipboard.copied", "Palette copied"),
                );
            } else {
                showActionStatus(
                    translate(
                        "paletteEditor.clipboard.copyFailed",
                        "Could not copy to clipboard",
                    ),
                );
            }
        } catch {
            showActionStatus(
                translate(
                    "paletteEditor.clipboard.copyFailed",
                    "Could not copy to clipboard",
                ),
            );
        }
    }

    async function pastePalette(mode: "replace" | "append") {
        let text: string;
        try {
            text = await PaletteService.getClipboardText();
        } catch {
            showActionStatus(
                translate(
                    "paletteEditor.clipboard.pasteFailed",
                    "Could not read clipboard",
                ),
            );
            return;
        }
        const colors = parseHexPaletteClipboard(text ?? "");
        if (!colors) {
            showActionStatus(
                translate(
                    "paletteEditor.clipboard.invalid",
                    "Clipboard does not contain a valid .hex palette",
                ),
            );
            return;
        }
        if (mode === "replace") {
            const kept = takePaletteColors(colors);
            setCurrentPaletteData((prev) => {
                if (!prev) return prev;
                return { ...prev, ColorsRGB: kept } as PaletteData;
            });
            setDisplayNumbers(sequentialDisplayNumbers(kept.length));
        } else {
            const roomBase = currentPaletteDataRef.current?.ColorsRGB?.length ?? 0;
            const kept = takePaletteColors(colors, roomBase);
            if (!kept.length) return;
            setCurrentPaletteData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    ColorsRGB: [...prev.ColorsRGB, ...takePaletteColors(kept, prev.ColorsRGB.length)],
                } as PaletteData;
            });
            setDisplayNumbers((prev) => {
                const labelsColors = takePaletteColors(kept, prev.length);
                let next = nextDisplayNumber(prev);
                const labels = labelsColors.map(() => next++);
                return [...prev, ...labels];
            });
        }
        setEditingIndex(undefined);
        setContentChanged(true);
    }

    function confirmResetPalette(confirmed: boolean) {
        setIsResettingPalette(false);
        if (!confirmed || !selectedPaletteGuid) return;
        const original = availablePalettes.find((x) => x.GuidString === selectedPaletteGuid);
        if (!original) return;
        setCurrentPaletteData(original);
        setDisplayNumbers(sequentialDisplayNumbers(original.ColorsRGB?.length ?? 0));
        setContentChanged(false);
        setEditingIndex(undefined);
        setDraggingIndex(null);
        setDropIndex(null);
        dragCandidateRef.current = null;
    }

    const onSetColor = useCallback((j: number, newColor: `#${string}`) => {
        setCurrentPaletteData((prev) => {
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
        await PaletteService.updatePalette(
            currentPaletteData.GuidString,
            currentPaletteData.Name,
            currentPaletteData.ColorsRGB,
        );
        const palettes = await PaletteService.listCityPalettes();
        onPalettesUpdated(palettes, currentPaletteData.GuidString);
    }

    async function confirmDeletePalette(confirmed: boolean) {
        setIsDeletingPalette(false);
        if (!confirmed || !currentPaletteData) return;
        const guid = currentPaletteData.GuidString;
        await PaletteService.deletePaletteFromCity(guid);
        const palettes = await PaletteService.listCityPalettes();
        onPalettesUpdated(palettes, null);
    }

    async function confirmRenamePalette(newName?: string) {
        setIsRenamingPalette(false);
        if (!newName?.trim() || !currentPaletteData) return;
        const originalPalette = availablePalettes.find(
            (x) => x.GuidString === currentPaletteData.GuidString,
        );
        if (!originalPalette) return;
        const unsavedColors = [...currentPaletteData.ColorsRGB];
        const unsavedLabels = [...displayNumbers];
        const unsavedChanged = contentChanged;
        const guid = currentPaletteData.GuidString;
        await PaletteService.updatePalette(guid, newName.trim(), originalPalette.ColorsRGB);
        const palettes = await PaletteService.listCityPalettes();
        skipNextPaletteReset.current = true;
        onPalettesUpdated(palettes, guid);
        const renamedPalette = palettes.find((x) => x.GuidString === guid);
        if (renamedPalette) {
            setCurrentPaletteData({ ...renamedPalette, ColorsRGB: unsavedColors });
            setDisplayNumbers(unsavedLabels);
            setContentChanged(unsavedChanged);
        }
    }

    if (!selectedPaletteGuid || !currentPaletteData) {
        return (
            <div className="xtm-paletteEditor_empty">
                {translate("paletteEditor.noPaletteSelected", "No palette selected")}
            </div>
        );
    }

    const ToolButton = VanillaComponentResolver.instance.ToolButton;

    return (
        <>
            <div className="xtm-paletteEditor">
                <div
                    className={
                        "xtm-paletteEditor_preview" +
                        (draggingIndex !== null ? " isReordering" : "")
                    }
                    ref={previewRef}
                    style={
                        {
                            "--lineIconSizeMultiplier": lineIconMultiplier,
                        } as CSSProperties
                    }
                >
                    {currentPaletteData.ColorsRGB.map((clr, idx) => (
                        <LineIconWithEditor
                            key={idx}
                            clr={clr}
                            idx={idx}
                            displayNumber={displayNumbers[idx] ?? idx + 1}
                            isOpen={editingIndex === idx}
                            isDragging={draggingIndex === idx}
                            isDropTarget={
                                draggingIndex !== null &&
                                dropIndex === idx &&
                                draggingIndex !== idx
                            }
                            onExcludeColor={onExcludeColor}
                            onSetColor={onSetColor}
                            onBeginDragCandidate={beginDragCandidate}
                            onSetDropTarget={setDropTarget}
                            onIconClick={handleIconClick}
                            setEditingIndex={setEditingIndex}
                        />
                    ))}
                </div>
                <div className="xtm-paletteEditor_details">
                    <div className="k45_keyValueContent">
                        <div className="key">GUID</div>
                        <div className="value">{currentPaletteData.GuidString}</div>
                    </div>
                </div>
                <div className="xtm-paletteEditor_actions">
                    <div className="xtm-paletteEditor_actionsStart">
                        <FocusDisabled>
                            <ToolButton
                                src={PLUS_ICON}
                                selected={false}
                                className="xtm-paletteEditor_iconBtn"
                                tooltip={translate("paletteEditor.addColor")}
                                onSelect={addNewColor}
                                disabled={(currentPaletteData.ColorsRGB?.length ?? 0) >= MAX_PALETTE_COLORS}
                                focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                            />
                            <ToolButton
                                src={DICE_ICON}
                                selected={false}
                                className="xtm-paletteEditor_iconBtn"
                                tooltip={translate("paletteEditor.shuffleColors", "Shuffle colors")}
                                onSelect={shuffleColors}
                                disabled={(currentPaletteData.ColorsRGB?.length ?? 0) < 2}
                                focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                            />
                            <div className="xtm-paletteEditor_actionsGroupSpacer" />
                            <ToolButton
                                src={PENCIL_ICON}
                                selected={false}
                                className="xtm-paletteEditor_iconBtn"
                                tooltip={translate("paletteEditor.renamePalette")}
                                onSelect={() => setIsRenamingPalette(true)}
                                focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                            />
                            <ToolButton
                                src={APPEND_ICON}
                                selected={false}
                                className="xtm-paletteEditor_iconBtn"
                                tooltip={translate("paletteEditor.appendPalette", "Append palette")}
                                onSelect={openAppendPicker}
                                disabled={(currentPaletteData.ColorsRGB?.length ?? 0) >= MAX_PALETTE_COLORS}
                                focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                            />
                            <div className="xtm-paletteEditor_actionsGroupSpacer" />
                            <ToolButton
                                src={COPY_ICON}
                                selected={false}
                                className="xtm-paletteEditor_iconBtn"
                                tooltip={translate("paletteEditor.copyPalette", "Copy palette")}
                                onSelect={copyPalette}
                                focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                            />
                            <ToolButton
                                src={PASTE_REPLACE_ICON}
                                selected={false}
                                className="xtm-paletteEditor_iconBtn"
                                tooltip={translate(
                                    "paletteEditor.pasteReplacePalette",
                                    "Paste palette (replace)",
                                )}
                                onSelect={() => void pastePalette("replace")}
                                focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                            />
                            <ToolButton
                                src={PASTE_APPEND_ICON}
                                selected={false}
                                className="xtm-paletteEditor_iconBtn"
                                tooltip={translate(
                                    "paletteEditor.pasteAppendPalette",
                                    "Paste palette (append)",
                                )}
                                onSelect={() => void pastePalette("append")}
                                disabled={(currentPaletteData.ColorsRGB?.length ?? 0) >= MAX_PALETTE_COLORS}
                                focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                            />
                            <div className="xtm-paletteEditor_actionsGroupSpacer" />
                            <ToolButton
                                src={RESET_ICON}
                                selected={false}
                                className="xtm-paletteEditor_iconBtn"
                                tooltip={translate("paletteEditor.resetChanges", "Reset changes")}
                                onSelect={() => setIsResettingPalette(true)}
                                disabled={!contentChanged}
                                focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                            />
                        </FocusDisabled>
                    </div>
                    <div className="xtm-paletteEditor_actionsStatus">{actionStatus ?? ""}</div>
                    <div className="xtm-paletteEditor_actionsEnd">
                        <button
                            type="button"
                            className="positiveBtn"
                            onClick={savePalette}
                            disabled={!contentChanged}
                        >
                            {translate("paletteEditor.saveChanges")}
                        </button>
                        <button
                            type="button"
                            className="negativeBtn"
                            onClick={() => setIsDeletingPalette(true)}
                        >
                            {translate("paletteEditor.deletePalette")}
                        </button>
                    </div>
                </div>
            </div>
            <StringInputDialog
                isActive={isRenamingPalette}
                setIsActive={setIsRenamingPalette}
                dialogTitle={translate("paletteEditor.rename.title", "Rename Palette")}
                dialogPromptText={translate(
                    "paletteEditor.rename.prompt",
                    "Enter the new name for the palette:",
                )}
                initialValue={currentPaletteData?.Name}
                actionOnSuccess={confirmRenamePalette}
                translate={translate}
            />
            <FilePickerDialog
                isActive={isPickingAppendFile}
                setIsActive={setIsPickingAppendFile}
                dialogTitle={translate("paletteEditor.append.title", "Append Palette")}
                dialogPromptText={translate(
                    "paletteEditor.append.prompt",
                    "Select a .hex palette file to append its colors:",
                )}
                allowedExtensions="*.hex"
                initialFolder={palettesFolderPath}
                generateDataProvider={generateDataProviderWithLibrary}
                bookmarks={[
                    {
                        name: translate("paletteEditor.import.libraryBookmark", "XTM: Library"),
                        targetPath: "XTM:/",
                    },
                ]}
                bookmarksTitle={translate("paletteEditor.import.bookmarksTitle", "Library")}
                actionOnSuccess={onAppendFileSelected}
                translate={translate}
                resolveFileItemPresentation={resolveFileItemPresentation}
            />
            {isDeletingPalette && (
                <Portal>
                    <ConfirmationDialog
                        title={translate("paletteEditor.delete.title", "Delete Palette")}
                        message={replaceArgs(
                            translate(
                                "paletteEditor.delete.message",
                                'Are you sure you want to delete the palette "{palette}"? This action cannot be undone.',
                            ),
                            { palette: currentPaletteData?.Name },
                        )}
                        onConfirm={() => confirmDeletePalette(true)}
                        onCancel={() => confirmDeletePalette(false)}
                    />
                </Portal>
            )}
            {isResettingPalette && (
                <Portal>
                    <ConfirmationDialog
                        title={translate("paletteEditor.reset.title", "Reset changes")}
                        message={translate(
                            "paletteEditor.reset.message",
                            "Discard unsaved changes to this palette? This cannot be undone.",
                        )}
                        onConfirm={() => confirmResetPalette(true)}
                        onCancel={() => confirmResetPalette(false)}
                    />
                </Portal>
            )}
        </>
    );
}

type PropsIcon = {
    clr: `#${string}`;
    idx: number;
    displayNumber: number;
    isOpen: boolean;
    isDragging: boolean;
    isDropTarget: boolean;
    onExcludeColor: (index: number) => void;
    onSetColor: (index: number, color: `#${string}`) => void;
    onBeginDragCandidate: (index: number, x: number, y: number) => void;
    onSetDropTarget: (index: number) => void;
    onIconClick: (index: number) => void;
    setEditingIndex: (index: number) => void;
};

const LineIconWithEditor = memo(
    ({
        clr,
        idx,
        displayNumber,
        isOpen,
        isDragging,
        isDropTarget,
        onExcludeColor,
        onSetColor,
        onBeginDragCandidate,
        onSetDropTarget,
        onIconClick,
        setEditingIndex,
    }: PropsIcon) => {
        const iconRef = useRef(null as any as HTMLDivElement);
        const pickerRef = useRef(null as any as HTMLDivElement);
        const [menuCss, setMenuCss] = useState({} as CSSProperties);
        const ColorPicker = VanillaComponentResolver.instance.ColorPicker;
        const noFocus = VanillaComponentResolver.instance.FOCUS_DISABLED;
        const VanillaColorUtils = VanillaFnResolver.instance.color;

        useEffect(() => {
            if (!isOpen) return;
            setMenuCss(
                onRecalculateContextMenuPosition(iconRef, calculateElementPosition(iconRef.current)),
            );
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
            document.addEventListener("mousedown", handleClickOutside, true);
            return () => document.removeEventListener("mousedown", handleClickOutside, true);
        }, [isOpen, setEditingIndex]);

        const containerClass =
            "lineIconContainer" +
            (isOpen ? " currentSelected" : "") +
            (isDragging ? " isDragging" : "") +
            (isDropTarget ? " isDropTarget" : "");

        return (
            <div
                className={containerClass}
                key={idx}
                ref={iconRef}
                onMouseEnter={() => onSetDropTarget(idx)}
            >
                <div
                    className="lineIcon"
                    style={
                        {
                            "--lineColor": clr,
                            "--contrastColor": ColorUtils.toRGBA(
                                ColorUtils.getContrastColorFor(ColorUtils.toColor01(clr)),
                            ),
                        } as CSSProperties
                    }
                    onMouseDown={(e) => {
                        if (e.button !== 0) return;
                        onBeginDragCandidate(idx, e.clientX, e.clientY);
                    }}
                    onClick={() => onIconClick(idx)}
                >
                    <div className={`routeNum singleLine chars${displayNumber.toString().length}`}>
                        {" "}
                        {displayNumber}
                    </div>
                </div>
                <div
                    className="excludeBtn"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        onExcludeColor(idx);
                    }}
                >
                    X
                </div>
                {isOpen && (
                    <Portal>
                        <div
                            ref={pickerRef}
                            style={menuCss}
                            className="k45_comm_contextMenu k45_xtm_colorPickerOverlay"
                        >
                            <ColorPicker
                                alpha={false}
                                focusKey={noFocus}
                                preview="None"
                                color={VanillaColorUtils.rgbaToHsva(ColorUtils.toColor01(clr))}
                                onChange={(x) =>
                                    onSetColor(
                                        idx,
                                        ColorUtils.toRGBHex(VanillaColorUtils.hsvaToRgba(x)),
                                    )
                                }
                                hexInput
                                colorWheel
                                sliderTextInput
                            />
                        </div>
                    </Portal>
                )}
            </div>
        );
    },
);
