import translate from "#utility/translate";
import {
    VehicleModelAvailableVehicles,
    VehicleModelGroupDetail,
    VehicleModelGroupLineShieldInfo,
    VehicleModelGroupListItem,
    VehicleModelPairDto,
} from "#service/VehicleModelGroupService";
import { Entity, VanillaWidgets } from "@klyte45/vuio-commons";
import { useEffect, useState } from "react";
import { VehicleModelCompositionsPanel } from "./VehicleModelCompositionsPanel";
import { VehicleModelGroupLinesPanel } from "./VehicleModelGroupLinesPanel";
import { hasAtLeastOneModel } from "./vehicleModelGroupUtils";

type Props = {
    detail: VehicleModelGroupDetail | null;
    shields: VehicleModelGroupLineShieldInfo[];
    groups: VehicleModelGroupListItem[];
    available: VehicleModelAvailableVehicles | null;
    onPatch: (patch: Partial<VehicleModelGroupDetail>) => void;
};

export function VehicleModelGroupEditor({
    detail,
    shields,
    groups,
    available,
    onPatch,
}: Props) {
    const StringInputField = VanillaWidgets.instance.StringInputField;
    const EditorItemRowNoFocus = VanillaWidgets.instance.EditorItemRowNoFocus;
    const editorModule = VanillaWidgets.instance.editorItemModule;
    const [nameDraft, setNameDraft] = useState(detail?.name ?? "");

    useEffect(() => {
        setNameDraft(detail?.name ?? "");
    }, [detail?.entity?.Index, detail?.entity?.Version, detail?.name]);

    if (!detail) {
        return (
            <div className="xtm-vmGroupEditor xtm-vmGroupEditor--empty">
                {translate("vehicleModelGroups.selectGroup", "Select a vehicle model group")}
            </div>
        );
    }

    const setModels = (models: VehicleModelPairDto[]) => {
        onPatch({ models });
    };

    const setLines = (lines: Entity[]) => {
        onPatch({ lines });
    };

    const modelsEmpty = !hasAtLeastOneModel(detail.models);

    return (
        <div className="xtm-vmGroupEditor">
            <div className="xtm-vmGroupEditor_top">
                <EditorItemRowNoFocus label={translate("vehicleModelGroups.field.name", "Name")}>
                    <StringInputField
                        className={editorModule.input}
                        value={nameDraft}
                        onChange={setNameDraft}
                        onChangeEnd={() => {
                            if (nameDraft !== detail.name) {
                                onPatch({ name: nameDraft });
                            }
                        }}
                        maxLength={64}
                    />
                </EditorItemRowNoFocus>
                {modelsEmpty && (
                    <div className="xtm-vmGroupEditor_hint">
                        {translate(
                            "vehicleModelGroups.modelsRequired",
                            "Add at least one composition with a vehicle before changes can be saved",
                        )}
                    </div>
                )}
            </div>
            <div className="xtm-vmGroupEditor_split">
                <VehicleModelCompositionsPanel
                    transportType={detail.transportType}
                    isCargo={!!detail.isCargo}
                    models={detail.models ?? []}
                    available={available}
                    onChangeModels={setModels}
                />
                <VehicleModelGroupLinesPanel
                    detail={detail}
                    shields={shields}
                    groups={groups}
                    onChangeLines={setLines}
                />
            </div>
        </div>
    );
}
