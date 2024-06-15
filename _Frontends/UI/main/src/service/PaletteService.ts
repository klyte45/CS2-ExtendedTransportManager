
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
    static async sendPaletteForCity(name: string, colors: `#${string}`[]) { await engine.call("k45::xtm.palettes.addPaletteToCity", name, colors) }
    static async listCityPalettes(): Promise<PaletteData[]> { return await engine.call("k45::xtm.palettes.listCityPalettes") }
    static async listLibraryPalettes(): Promise<PaletteData[]> { return await engine.call("k45::xtm.palettes.listLibraryPalettes") }
    static async openPalettesFolder(): Promise<void> { return await engine.call("k45::xtm.palettes.openPalettesFolder") }
    static async exportToLibrary(palette: PaletteData): Promise<any> { return engine.call("k45::xtm.palettes.exportToLibrary", palette.Name, palette.ColorsRGB).then(x => palette.__exported = true) }
    static async reloadPalettes(): Promise<void> { return await engine.call("k45::xtm.palettes.reloadPalettes") }
}

