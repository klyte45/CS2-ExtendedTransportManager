import { TransportType } from '#enum/TransportType';


export class AutoColorService {
    public static async passengerModalSettings(): Promise<Record<TransportType, string>> {
        return await engine.call("k45::xtm.autoColor.passengerModalSettings");
    }
    public static async cargoModalSettings(): Promise<Record<TransportType, string>> {
        return await engine.call("k45::xtm.autoColor.cargoModalSettings");
    }
    public static async passengerModalAvailable(): Promise<TransportType[]> {
        return await engine.call("k45::xtm.autoColor.passengerModalAvailable");
    }
    public static async cargoModalAvailable(): Promise<TransportType[]> {
        return await engine.call("k45::xtm.autoColor.cargoModalAvailable");
    }
}
