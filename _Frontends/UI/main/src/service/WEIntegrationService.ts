import { Entity, ValuableObject } from "@klyte45/euis-components";
import { StationData } from "./LineManagementService";

export enum WEDestinationKeyframeType {
    RouteName,
    EntityName,
    RouteNumber,
    FixedString,
    NextStopSimple,
    EntityNameOrDistrict
}
export type WEDynamicBlindItem = {
    useUntilStop?: Entity;
    stopPos?: number,
    keyframes: WEDestinationDynamicKeyframe[];
    staticKeyframeIdx: number;
}
export type WEDestinationDynamicKeyframe = {
    targetEntity?: Entity
    prefix?: string
    suffix?: string
    type: ValuableObject<WEDestinationKeyframeType>
    framesLength: number
    sample?: string
}

export class WEIntegrationService {
    private static clipboard?: WEDynamicBlindItem[]

    static async isAvailable(): Promise<boolean> { return await engine.call("k45::xtm.weIntegration.isAvailable") }
    static async getBlindsKeyframes(line: Entity): Promise<WEDynamicBlindItem[]> { return await engine.call("k45::xtm.weIntegration.getBlindsKeyframes", line) }
    static async setBlindsKeyframes(line: Entity, items: WEDynamicBlindItem[]): Promise<boolean> { return await engine.call("k45::xtm.weIntegration.setBlindsKeyframes", line, items) }

    static setClipboard(newData: WEDynamicBlindItem[], stopData: StationData[]) {
        this.clipboard = newData.map(x => {
            x.stopPos = x.useUntilStop ? stopData.find(y => y.waypoint.Index == x.useUntilStop.Index)?.position ?? 1 : 1
            return { ...x };
        })
    }

    static hasClipboard() { return !!this.clipboard }

    static getClipboard(stopData: StationData[]) {
        return this.clipboard.map(x => {
            const result = { ...x };
            result.useUntilStop = x.stopPos == 1 ? { Index: 0, Version: 0 } : stopData.map(t => [Math.abs(t.position - x.stopPos), t] as [number, StationData]).sort((a, b) => a[0] - b[0])[0][1].waypoint
            return result;
        })
    }
}