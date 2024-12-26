import { Entity, ValuableObject } from "@klyte45/euis-components";

export type WEDynamicBlindItem = {
    useUntilStop: Entity;
    keyframes: WEDestinationDynamicKeyframe[];
    staticKeyframeIdx: number;
}
export enum WEDestinationKeyframeType {
    RouteName,
    EntityName,
    RouteNumber,
    FixedString
}

export type WEDestinationDynamicKeyframe = {
    targetEntity: Entity
    prefix: string
    suffix: string
    type: ValuableObject<WEDestinationKeyframeType>
    framesLength: number
}

export class WEIntegrationService {
    static async isAvailable(): Promise<boolean> { return await engine.call("k45::weIntegration.isAvailable") }
    static async getBlindsKeyframes(line: Entity): Promise<WEDynamicBlindItem[]> { return await engine.call("k45::weIntegration.getBlindsKeyframes", line) }
    static async setBlindsKeyframes(line: Entity, items: WEDynamicBlindItem[]): Promise<boolean> { return await engine.call("k45::weIntegration.setBlindsKeyframes", line, items) }
}