
export type PaletteData = {
    Name: string,
    ColorsRGB: `#${string}`[],
    GuidString: string,
    ChecksumString: string
}

export class PaletteService {
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