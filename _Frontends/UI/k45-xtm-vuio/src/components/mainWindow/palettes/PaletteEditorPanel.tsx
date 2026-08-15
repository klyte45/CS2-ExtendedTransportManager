import { PaletteData, PaletteService } from "#service/PaletteService";
import translate from "#utility/translate";
import {
    calculateElementPosition,
    ColorUtils,
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
    useRef,
    useState,
} from "react";

const PLUS_ICON = "coui://uil/Standard/Plus.svg";
const DICE_ICON = "coui://uil/Standard/Dice.svg";
const PENCIL_ICON = "coui://uil/Standard/PencilPaper.svg";

const CELL_BASE_REM = 4.55;
const MAX_MULTIPLIER = 30;
const MIN_MULTIPLIER = 1;
const DEFAULT_MULTIPLIER = 3;

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
    const [editingIndex, setEditingIndex] = useState<number>();
    const [contentChanged, setContentChanged] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);
    const [lineIconMultiplier, setLineIconMultiplier] = useState(DEFAULT_MULTIPLIER);
    const [isRenamingPalette, setIsRenamingPalette] = useState(false);
    const [isDeletingPalette, setIsDeletingPalette] = useState(false);
    const skipNextPaletteReset = useRef(false);
    const currentPaletteDataRef = useRef(currentPaletteData);
    currentPaletteDataRef.current = currentPaletteData;

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
        setCurrentPaletteData(
            availablePalettes.find((x) => x.GuidString === selectedPaletteGuid) ?? undefined,
        );
        setContentChanged(false);
        setEditingIndex(undefined);
    }, [selectedPaletteGuid, availablePalettes]);

    const onExcludeColor = useCallback((j: number) => {
        setCurrentPaletteData((prev) => {
            if (!prev) return prev;
            const newColors = [...prev.ColorsRGB];
            newColors.splice(j, 1);
            return { ...prev, ColorsRGB: newColors } as PaletteData;
        });
        setContentChanged(true);
    }, []);

    const onMoveColor = useCallback((j: number, delta: number) => {
        setCurrentPaletteData((prev) => {
            if (!prev) return prev;
            const newColors = [...prev.ColorsRGB];
            const color = newColors.splice(j, 1);
            newColors.splice(Math.min(Math.max(j + delta, 0), newColors.length), 0, ...color);
            return { ...prev, ColorsRGB: newColors } as PaletteData;
        });
        setContentChanged(true);
    }, []);

    function shuffleColors() {
        setCurrentPaletteData((prev) => {
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
        setCurrentPaletteData((prev) => {
            if (!prev) return prev;
            return { ...prev, ColorsRGB: [...prev.ColorsRGB, "#FFFFFF"] } as PaletteData;
        });
        setContentChanged(true);
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
        const unsavedChanged = contentChanged;
        const guid = currentPaletteData.GuidString;
        await PaletteService.updatePalette(guid, newName.trim(), originalPalette.ColorsRGB);
        const palettes = await PaletteService.listCityPalettes();
        skipNextPaletteReset.current = true;
        onPalettesUpdated(palettes, guid);
        const renamedPalette = palettes.find((x) => x.GuidString === guid);
        if (renamedPalette) {
            setCurrentPaletteData({ ...renamedPalette, ColorsRGB: unsavedColors });
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
                    className="xtm-paletteEditor_preview"
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
                            isOpen={editingIndex === idx}
                            onExcludeColor={onExcludeColor}
                            onMoveColor={onMoveColor}
                            onSetColor={onSetColor}
                            setEditingIndex={setEditingIndex}
                            totalLength={currentPaletteData.ColorsRGB.length}
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
                    <button
                        type="button"
                        className="positiveBtn"
                        onClick={savePalette}
                        disabled={!contentChanged}
                    >
                        {translate("paletteEditor.saveChanges")}
                    </button>
                    <div className="xtm-paletteEditor_actionsGrow" />
                    <FocusDisabled>
                        <ToolButton
                            src={PLUS_ICON}
                            selected={false}
                            className="xtm-paletteEditor_iconBtn"
                            tooltip={translate("paletteEditor.addColor")}
                            onSelect={addNewColor}
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
                        <ToolButton
                            src={PENCIL_ICON}
                            selected={false}
                            className="xtm-paletteEditor_iconBtn"
                            tooltip={translate("paletteEditor.renamePalette")}
                            onSelect={() => setIsRenamingPalette(true)}
                            focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                        />
                    </FocusDisabled>
                    <div className="xtm-paletteEditor_actionsGrow" />
                    <button
                        type="button"
                        className="negativeBtn"
                        onClick={() => setIsDeletingPalette(true)}
                    >
                        {translate("paletteEditor.deletePalette")}
                    </button>
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
        </>
    );
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

const LineIconWithEditor = memo(
    ({
        clr,
        idx,
        isOpen,
        onExcludeColor,
        onMoveColor,
        onSetColor,
        setEditingIndex,
        totalLength,
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

        return (
            <div
                className={"lineIconContainer" + (isOpen ? " currentSelected" : "")}
                key={idx}
                ref={iconRef}
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
                    onClick={() => setEditingIndex(idx)}
                >
                    <div className={`routeNum singleLine chars${(idx + 1)?.toString().length}`}>
                        {" "}
                        {idx + 1}
                    </div>
                </div>
                <div className="excludeBtn" onClick={() => onExcludeColor(idx)}>
                    X
                </div>
                {idx > 0 && (
                    <div
                        className="moveMinus"
                        onClick={(x) => onMoveColor(idx, x.shiftKey ? -Infinity : -1)}
                    >
                        ⇚
                    </div>
                )}
                {idx < totalLength - 1 && (
                    <div
                        className="movePlus"
                        onClick={(x) => onMoveColor(idx, x.shiftKey ? Infinity : 1)}
                    >
                        ⇛
                    </div>
                )}
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
