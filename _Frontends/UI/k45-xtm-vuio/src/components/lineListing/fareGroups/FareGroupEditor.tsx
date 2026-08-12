import translate from "#utility/translate";
import {
    FareGroupDetail,
    FareGroupHourExceptionDto,
    FareGroupLineShieldInfo,
    FareGroupListItem,
    FareTicketSliderBounds,
} from "#service/FareGroupService";
import { Entity, VanillaComponentResolver, VanillaWidgets } from "@klyte45/vuio-commons";
import { useEffect, useState } from "react";
import { FareGroupExceptionList } from "./FareGroupExceptionList";
import { FareGroupLinesPanel } from "./FareGroupLinesPanel";
import { findExceptionOverlapError } from "./fareGroupUtils";

type Props = {
    detail: FareGroupDetail | null;
    shields: FareGroupLineShieldInfo[];
    groups: FareGroupListItem[];
    bounds: FareTicketSliderBounds;
    onPatch: (patch: Partial<FareGroupDetail>) => void;
};

export function FareGroupEditor({ detail, shields, groups, bounds, onPatch }: Props) {
    const StringInputField = VanillaWidgets.instance.StringInputField;
    const EditorItemRowNoFocus = VanillaWidgets.instance.EditorItemRowNoFocus;
    const IntInput = VanillaComponentResolver.instance.IntInput;
    const editorModule = VanillaWidgets.instance.editorItemModule;
    const [nameDraft, setNameDraft] = useState(detail?.name ?? "");

    useEffect(() => {
        setNameDraft(detail?.name ?? "");
    }, [detail?.entity?.Index, detail?.entity?.Version, detail?.name]);

    if (!detail) {
        return (
            <div className="xtm-fareGroupEditor xtm-fareGroupEditor--empty">
                {translate("fareGroups.selectGroup", "Select a fare group")}
            </div>
        );
    }

    const setExceptions = (exceptions: FareGroupHourExceptionDto[]) => {
        onPatch({ exceptions });
    };

    const setLines = (lines: Entity[]) => {
        onPatch({ lines });
    };

    const overlapError = findExceptionOverlapError(detail.exceptions ?? []);

    return (
        <div className="xtm-fareGroupEditor">
            <div className="xtm-fareGroupEditor_top">
                <EditorItemRowNoFocus label={translate("fareGroups.field.name", "Name")}>
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
                <EditorItemRowNoFocus label={translate("fareGroups.field.defaultFare", "Default fare")}>
                    <IntInput
                        className={editorModule.input}
                        value={Math.round(detail.defaultFare)}
                        min={0}
                        max={Math.round(bounds.max)}
                        onChange={(v) => onPatch({ defaultFare: v })}
                        focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                    />
                </EditorItemRowNoFocus>
                {overlapError && (
                    <div className="xtm-fareGroupEditor_hint">
                        {translate(
                            "fareGroups.exceptions.saveBlocked",
                            "Fix exception hours before changes can be saved",
                        )}
                    </div>
                )}
            </div>
            <div className="xtm-fareGroupEditor_split">
                <FareGroupExceptionList
                    exceptions={detail.exceptions ?? []}
                    defaultFare={detail.defaultFare}
                    bounds={bounds}
                    onChange={setExceptions}
                />
                <FareGroupLinesPanel
                    detail={detail}
                    shields={shields}
                    groups={groups}
                    onChangeLines={setLines}
                />
            </div>
        </div>
    );
}
