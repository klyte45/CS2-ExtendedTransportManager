import engine from "cohtml/cohtml"

export type PaletteData = {
    readonly Name: string,
    readonly ColorsRGB: `#${string}`[],
    readonly GuidString: string,
    readonly ChecksumString: string,
    __exported?: boolean
}

export class PaletteService {
    static async updatePalette(GuidString: string, Name: string, ColorsRGB: `#${string}`[]) { await engine.call("k45::xtm.palettes.updateForCity", GuidString, Name, ColorsRGB) }
    static async deletePaletteFromCity(GuidString: string) { await engine.call("k45::xtm.palettes.deleteFromCity", GuidString) }
    static doOnCityPalettesUpdated(event: () => void) { engine.on("k45::xtm.palettes.onCityPalettesChanged", event) }
    static undoOnCityPalettesUpdated() { engine.off("k45::xtm.palettes.onCityPalettesChanged") }
    static async sendPaletteForCity(name: string, colors: `#${string}`[]) { await engine.call("k45::xtm.palettes.addPaletteToCity", name, colors) }
    static async listCityPalettes(): Promise<PaletteData[]> { return await engine.call("k45::xtm.palettes.listCityPalettes") }
    static async listDefaultPalettes(): Promise<PaletteData[]> { return await engine.call("k45::xtm.palettes.listDefaultPalettes") }
    static async openPalettesFolder(): Promise<void> { return await engine.call("k45::xtm.palettes.openPalettesFolder") }
    static async getPalettesFolderPath(): Promise<string> { return await engine.call("k45::xtm.palettes.getPalettesFolderPath") }
    static async addPaletteFromFile(file: string): Promise<PaletteData> { return await engine.call("k45::xtm.palettes.addPaletteFromFile", file) }
}

