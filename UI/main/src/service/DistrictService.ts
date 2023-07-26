
import { nameToString, replaceArgs } from "#utility/name.utils";
import translate from "#utility/translate";
import { StationData } from "./LineManagementService";

export class DistrictService {
    static getEffectiveDistrictName(station: StationData) {
        return station.district.Index > 0 ? nameToString(station.districtName)
            : station.isOutsideConnection ? replaceArgs(translate("lineViewer.colossalNationFmt"), { city: nameToString(station.name) })
                : translate("lineMap.noDistrict");
    }
}
