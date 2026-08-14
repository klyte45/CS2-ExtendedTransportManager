import { PaletteData, PaletteService } from "#service/PaletteService";
import translate from "#utility/translate";
import {
    BaseFileService,
    DataProvider,
    FilePickerDialog,
    StringInputDialog,
    VanillaComponentResolver,
} from "@klyte45/vuio-commons";
import { FocusDisabled } from "cs2/input";
import { Scrollable } from "cs2/ui";
import engine from "cohtml/cohtml";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PaletteEditorPanel } from "./PaletteEditorPanel";
import { PaletteListCard } from "./PaletteListCard";
import { TransportPaletteAssignPanel } from "./TransportPaletteAssignPanel";

const PLUS_ICON = "coui://uil/Standard/Plus.svg";
const FOLDER_ICON = "coui://uil/Standard/Folder.svg";
const STAR_ICON = "coui://uil/Standard/StarFilledSmall.svg";
const XTM_LIBRARY_PATH = "XTM:/";

type Props = {
    onPalettesChanged?: (count: number) => void;
};

export function XtmPalettesPage({ onPalettesChanged }: Props) {
    const ToolButton = VanillaComponentResolver.instance.ToolButton;
    const [availablePalettes, setAvailablePalettes] = useState<PaletteData[]>([]);
    const [selectedPaletteGuid, setSelectedPaletteGuid] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAddingPalette, setIsAddingPalette] = useState(false);
    const [isPickingImportFile, setIsPickingImportFile] = useState(false);
    const [palettesFolderPath, setPalettesFolderPath] = useState("");
    const [importInitialFolder, setImportInitialFolder] = useState("");
    const libraryPalettesCache = useRef<PaletteData[]>([]);

    const openImportPicker = (folder: string) => {
        libraryPalettesCache.current = [];
        setImportInitialFolder(folder);
        setIsPickingImportFile(true);
    };

    const generateDataContainer = (folder: string, allowedExtension: string) =>
        BaseFileService.generateDataProvider("k45::xtm", folder, allowedExtension);

    const applyPalettes = useCallback(
        (palettes: PaletteData[], selectGuid?: string | null) => {
            const sorted = [...palettes].sort((a, b) =>
                a.Name.localeCompare(b.Name, undefined, { sensitivity: "base" }),
            );
            setAvailablePalettes(sorted);
            onPalettesChanged?.(sorted.length);
            if (selectGuid !== undefined) {
                setSelectedPaletteGuid(selectGuid);
            }
        },
        [onPalettesChanged],
    );

    const refresh = useCallback(async () => {
        const list = (await PaletteService.listCityPalettes()) ?? [];
        applyPalettes(list);
        return list;
    }, [applyPalettes]);

    useEffect(() => {
        PaletteService.getPalettesFolderPath().then(setPalettesFolderPath);
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const list = await PaletteService.listCityPalettes();
                if (cancelled) return;
                applyPalettes(list ?? []);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        engine.whenReady.then(() => {
            PaletteService.doOnCityPalettesUpdated(() => {
                void refresh();
            });
        });
        return () => {
            cancelled = true;
            PaletteService.undoOnCityPalettesUpdated();
        };
    }, [applyPalettes, refresh]);

    const sortedPalettes = useMemo(
        () =>
            [...availablePalettes].sort((a, b) =>
                a.Name.localeCompare(b.Name, undefined, { sensitivity: "base" }),
            ),
        [availablePalettes],
    );

    async function generateDataProviderWithLibrary(
        folder: string,
        allowedExtension: string,
    ): Promise<DataProvider> {
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
                    if (parts[i] !== subParts[i]) {
                        matches = false;
                        break;
                    }
                }
                if (!matches) continue;
                const remaining = parts.slice(depth);
                if (remaining.length === 1) {
                    items.push({
                        displayName: remaining[0] + ".hex",
                        directory: false,
                        fullPath: "XTM:/" + palette.Name + ".hex",
                    });
                } else {
                    const dirName = remaining[0];
                    if (!seen.has(dirName)) {
                        seen.add(dirName);
                        const dirFullPath =
                            subPath === ""
                                ? "XTM:/" + dirName + "/"
                                : "XTM:/" + subPath + "/" + dirName + "/";
                        items.push({ displayName: dirName, directory: true, fullPath: dirFullPath });
                    }
                }
            }
            return items;
        }
        return generateDataContainer(folder, allowedExtension);
    }

    async function confirmAddNewPalette(name?: string) {
        if (!name?.trim()) return;
        await PaletteService.sendPaletteForCity(name.trim(), ["#FFFFFF"]);
        const palettes = await PaletteService.listCityPalettes();
        const newPalette = palettes.find((x) => x.Name === name.trim());
        applyPalettes(palettes, newPalette?.GuidString ?? null);
    }

    async function onImportFileSelected(path?: string) {
        setIsPickingImportFile(false);
        if (!path) return;
        let data: PaletteData | undefined;
        if (path.startsWith("XTM:/")) {
            const paletteName = path.slice("XTM:/".length).replace(/\.hex$/, "");
            const palette = libraryPalettesCache.current.find((x) => x.Name === paletteName);
            if (!palette) return;
            const paletteToSave = { ...palette };
            paletteToSave.Name = paletteToSave.Name.split("/").slice(-1)[0];
            await PaletteService.sendPaletteForCity(paletteToSave.Name, paletteToSave.ColorsRGB);
            data = paletteToSave;
        } else {
            data = await PaletteService.addPaletteFromFile(path);
        }
        if (!data) return;
        const palettes = await PaletteService.listCityPalettes();
        applyPalettes(palettes, data.GuidString);
    }

    return (
        <div className="xtm-palettesPage">
            <div className="xtm-palettesPage_upper">
                <div className="xtm-palettesPage_list">
                    <div className="xtm-palettesPage_listHeader">
                        <div className="xtm-palettesPage_listTitle">
                            {translate("cityPalettesLibrary.title", "Available palettes")}
                        </div>
                        <FocusDisabled>
                            <ToolButton
                                src={PLUS_ICON}
                                selected={false}
                                tooltip={translate("paletteEditor.addNewPalette")}
                                onSelect={() => setIsAddingPalette(true)}
                                focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                            />
                            <ToolButton
                                src={FOLDER_ICON}
                                selected={false}
                                tooltip={translate("paletteEditor.importPalette")}
                                onSelect={() => openImportPicker(palettesFolderPath)}
                                focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                            />
                            <ToolButton
                                src={STAR_ICON}
                                selected={false}
                                tooltip={translate(
                                    "paletteEditor.import.libraryBookmark",
                                    "Default library",
                                )}
                                onSelect={() => openImportPicker(XTM_LIBRARY_PATH)}
                                focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                            />
                        </FocusDisabled>
                    </div>
                    <div className="xtm-palettesPage_listBody">
                        {loading ? (
                            <div className="xtm-palettesPage_status">
                                {translate("fareGroups.loading", "Loading…")}
                            </div>
                        ) : sortedPalettes.length === 0 ? (
                            <div className="xtm-palettesPage_status">
                                {translate("paletteEditor.noPalettes")}
                            </div>
                        ) : (
                            <Scrollable className="xtm-palettesPage_listScroll">
                                {sortedPalettes.map((p) => (
                                    <PaletteListCard
                                        key={p.GuidString}
                                        palette={p}
                                        selected={selectedPaletteGuid === p.GuidString}
                                        onSelect={() => setSelectedPaletteGuid(p.GuidString)}
                                    />
                                ))}
                            </Scrollable>
                        )}
                    </div>
                </div>
                <div className="xtm-palettesPage_editor">
                    <PaletteEditorPanel
                        availablePalettes={availablePalettes}
                        selectedPaletteGuid={selectedPaletteGuid}
                        onPalettesUpdated={applyPalettes}
                    />
                </div>
            </div>
            <div className="xtm-palettesPage_lower">
                <TransportPaletteAssignPanel availablePalettes={availablePalettes} />
            </div>
            <StringInputDialog
                isActive={isAddingPalette}
                setIsActive={setIsAddingPalette}
                dialogTitle={translate("paletteEditor.addPalette.title", "New Palette")}
                dialogPromptText={translate(
                    "paletteEditor.addPalette.prompt",
                    "Enter a name for the new palette:",
                )}
                actionOnSuccess={confirmAddNewPalette}
                translate={translate}
            />
            <FilePickerDialog
                isActive={isPickingImportFile}
                setIsActive={setIsPickingImportFile}
                dialogTitle={translate("paletteEditor.import.title", "Import Palette")}
                dialogPromptText={translate(
                    "paletteEditor.import.prompt",
                    "Select a .hex palette file to import:",
                )}
                allowedExtensions="*.hex"
                initialFolder={importInitialFolder || palettesFolderPath}
                generateDataProvider={generateDataProviderWithLibrary}
                bookmarks={[
                    {
                        name: translate("paletteEditor.import.libraryBookmark", "XTM: Library"),
                        targetPath: "XTM:/",
                    },
                ]}
                bookmarksTitle={translate("paletteEditor.import.bookmarksTitle", "Library")}
                actionOnSuccess={onImportFileSelected}
                translate={translate}
            />
        </div>
    );
}
