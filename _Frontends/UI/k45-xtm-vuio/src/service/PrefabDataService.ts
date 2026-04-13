import { Entity, ValuableName } from "@klyte45/vuio-commons";
import engine from "cohtml/cohtml";

const prefix = 'k45::xtm.prefabData.';
export class PrefabDataService {
    static async GetPrefabData(entity: Entity): Promise<PrefabDataUI> {
        return await engine.call(`${prefix}getPrefabData`, entity);
    }

}
export type PrefabDataUI = {
    index: number;
    name: string;
    imageUrl: string;
}
