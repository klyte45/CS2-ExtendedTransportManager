import { PaletteData, PaletteService } from "#service/PaletteService";
import translate from "#utility/translate";
import {
    BaseFileService,
    DataProvider,
    DataProviderItem,
    ResolveFileItemPresentation,
} from "@klyte45/vuio-commons";
import { MutableRefObject } from "react";
import { PaletteColorSwatches } from "./PaletteColorSwatches";

export const XTM_LIBRARY_PATH = "XTM:/";
export const FILE_PICKER_MAX_SWATCHES = 16;

export type LibraryPalettesCacheRef = MutableRefObject<PaletteData[]>;

async function ensureLibraryCache(libraryCacheRef: LibraryPalettesCacheRef): Promise<PaletteData[]> {
    if (!libraryCacheRef.current?.length) {
        const list = await PaletteService.listDefaultPalettes();
        libraryCacheRef.current = Array.isArray(list) ? list : [];
    }
    return libraryCacheRef.current;
}

export async function generatePaletteDataProviderWithLibrary(
    folder: string,
    allowedExtension: string,
    libraryCacheRef: LibraryPalettesCacheRef,
): Promise<DataProvider> {
    if (folder.startsWith("XTM:/")) {
        const palettes = await ensureLibraryCache(libraryCacheRef);
        const subPath = folder.slice("XTM:/".length).replace(/\/$/, "");
        const subParts = subPath === "" ? [] : subPath.split("/");
        const depth = subParts.length;
        const seen = new Set<string>();
        const items: DataProvider = [];
        for (const palette of palettes) {
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
    return BaseFileService.generateDataProvider("k45::xtm", folder, allowedExtension);
}

export async function resolvePaletteFileColors(
    path: string,
    libraryCacheRef: LibraryPalettesCacheRef,
): Promise<string[] | null> {
    if (path.startsWith("XTM:/")) {
        const palettes = await ensureLibraryCache(libraryCacheRef);
        const paletteName = path.slice("XTM:/".length).replace(/\.hex$/, "");
        const palette = palettes.find((x) => x.Name === paletteName);
        return palette?.ColorsRGB?.length ? palette.ColorsRGB : null;
    }
    return PaletteService.previewPaletteFromFile(path);
}

export function createPaletteFileItemPresentation(
    libraryCacheRef: LibraryPalettesCacheRef,
): ResolveFileItemPresentation {
    return async (item: DataProviderItem) => {
        if (item.directory) return undefined;

        const colors = await resolvePaletteFileColors(item.fullPath, libraryCacheRef);

        if (!colors?.length) {
            return {
                valid: false,
                tooltip: translate(
                    "paletteEditor.import.invalidFile",
                    "Not a valid palette file",
                ),
            };
        }
        return {
            valid: true,
            extra: (
                <PaletteColorSwatches colors={colors} maxSwatches={FILE_PICKER_MAX_SWATCHES} />
            ),
        };
    };
}
