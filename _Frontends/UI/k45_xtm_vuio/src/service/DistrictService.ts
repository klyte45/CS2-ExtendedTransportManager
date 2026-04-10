
import translate from "#utility/translate"
import { nameToString, replaceArgs } from "@klyte45/vuio-commons";
import { StationData } from "./LineManagementService";

export class DistrictService {
    static getEffectiveDistrictName(station: StationData) {
        return station.district.Index > 0 ? nameToString(station.districtName)
            : station.isOutsideConnection ? replaceArgs(translate("lineViewer.colossalNationFmt"), { city: nameToString(station.name) })
                : translate("lineMap.noDistrict");
    }
}
