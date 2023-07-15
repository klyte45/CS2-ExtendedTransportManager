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
    public static async setModalAutoColor(transportType: TransportType, isCargo: boolean, guid: string) {
        return await engine.call("k45::xtm.autoColor.setAutoColorFor", transportType, isCargo, guid ?? null);
    }
    static doOnAutoColorSettingsChanged(event: () => void) {
        engine.on("k45::xtm.autoColor.onAutoColorSettingsChanged", event)
    }
}
