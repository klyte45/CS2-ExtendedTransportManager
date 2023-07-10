import { TransportType } from '#enum/TransportType'

export type PaletteData = {
    Name: string,
    ColorsRGB: `#${string}`[],
    GuidString: string,
    ChecksumString: string
}

export class PaletteService {
    public static async listPalettes(): Promise<PaletteData[]> {
        return await engine.call("k45::xtm.palettes.listPalettes")
    }
    public static async passengerModalSettings(): Promise<Record<TransportType, string>> {
        return await engine.call("k45::xtm.palettes.passengerModalSettings")
    }
    public static async cargoModalSettings(): Promise<Record<TransportType, string>> {
        return await engine.call("k45::xtm.palettes.cargoModalSettings")
    }
    public static async passengerModalAvailable(): Promise<TransportType[]> {
        return await engine.call("k45::xtm.palettes.passengerModalAvailable")
    }
    public static async cargoModalAvailable(): Promise<TransportType[]> {
        return await engine.call("k45::xtm.palettes.cargoModalAvailable")
    }
}