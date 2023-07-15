
export type PaletteData = {
    readonly Name: string,
    readonly ColorsRGB: `#${string}`[],
    readonly GuidString: string,
    readonly ChecksumString: string,
}

export class PaletteService {
    static doOnCityPalettesUpdated(event: () => void) {
        engine.on("k45::xtm.palettes.onCityPalettesChanged", () => event())
    }
    static async sendPaletteForCity(name: string, colors: `#${string}`[]) {
        await engine.call("k45::xtm.palettes.addPaletteToCity", name, colors)
    }
    public static async listCityPalettes(): Promise<PaletteData[]> {
        return await engine.call("k45::xtm.palettes.listCityPalettes")
    }
    public static async listLibraryPalettes(): Promise<PaletteData[]> {
        return await engine.call("k45::xtm.palettes.listLibraryPalettes")
    }
    public static async listEditablePalettes(): Promise<PaletteData[]> {
        return await engine.call("k45::xtm.palettes.listEditablePalettes")
    }

}