import { Entity } from "@klyte45/euis-components"

export type ST_Route ={
    RouteRuleId: number
    RouteRuleName: string
}


export class STIntegrationService {
    static async isAvailable(): Promise<boolean> { return await engine.call("k45::xtm.stIntegration.isAvailable") }
    static async getRouteRule(e: Entity): Promise<ST_Route> { return await engine.call("k45::xtm.stIntegration.getRouteRule",e) }
    static async listAvailableRouteRules(e: Entity): Promise<ST_Route[]> { return await engine.call("k45::xtm.stIntegration.listAvailableRouteRules",e) }
    static async setRouteRule(e: Entity, ruleId: number): Promise<void> { return await engine.call("k45::xtm.stIntegration.setRouteRule",e,ruleId) }
}