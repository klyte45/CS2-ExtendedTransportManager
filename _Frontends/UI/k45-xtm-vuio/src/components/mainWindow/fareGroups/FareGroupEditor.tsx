import translate from "#utility/translate";
import {
    FareGroupDetail,
    FareGroupHourExceptionDto,
    FareGroupLineShieldInfo,
    FareGroupListItem,
    FareTicketSliderBounds,
} from "#service/FareGroupService";
import { Unit } from "#enum/Unit";
import { Entity, replaceArgs, VanillaComponentResolver, VanillaWidgets } from "@klyte45/vuio-commons";
import { LocalizedNumber, useLocalization } from "cs2/l10n";
import { useEffect, useMemo, useState } from "react";
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

let persistedFareTableExpanded = false;

function formatFareLabel(
    localization: ReturnType<typeof useLocalization>,
    fare: number,
): string {
    if (fare === 0) return translate("fareGroups.fareFree", "Free");
    return LocalizedNumber.renderString(localization, {
        value: Math.round(fare),
        unit: Unit.Money,
        signed: false,
    });
}

function formatHours(start: number, end: number): string {
    return replaceArgs(translate("fareGroups.fareTable.hours", "{start}:00 - {end}:59"), {
        start: String(start),
        end: String(end),
    });
}

function sortExceptions(exceptions: FareGroupHourExceptionDto[]): FareGroupHourExceptionDto[] {
    return [...exceptions].sort((a, b) => {
        if (a.startingHour !== b.startingHour) return a.startingHour - b.startingHour;
        return a.endingHour - b.endingHour;
    });
}

export function FareGroupEditor({ detail, shields, groups, bounds, onPatch }: Props) {
    const StringInputField = VanillaWidgets.instance.StringInputField;
    const EditorItemRowNoFocus = VanillaWidgets.instance.EditorItemRowNoFocus;
    const IntInput = VanillaComponentResolver.instance.IntInput;
    const InfoSectionFoldout = VanillaComponentResolver.instance.InfoSectionFoldout;
    const editorModule = VanillaWidgets.instance.editorItemModule;
    const localization = useLocalization();
    const [nameDraft, setNameDraft] = useState(detail?.name ?? "");

    useEffect(() => {
        setNameDraft(detail?.name ?? "");
    }, [detail?.entity?.Index, detail?.entity?.Version, detail?.name]);

    const sortedExceptions = useMemo(
        () => sortExceptions(detail?.exceptions ?? []),
        [detail?.exceptions],
    );

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
                <InfoSectionFoldout
                    header={translate("fareGroups.fareTable.title", "Fare schedule")}
                    initialExpanded={persistedFareTableExpanded}
                    onToggleExpanded={(expanded) => {
                        persistedFareTableExpanded = expanded;
                    }}
                    disableFocus
                    className="xtm-fareGroupEditor_fareTableFoldout"
                >
                    <div className="xtm-fareGroupEditor_fareTable">
                        <div className="xtm-fareGroupEditor_fareTableRow xtm-fareGroupEditor_fareTableRow--default">
                            <div className="xtm-fareGroupEditor_fareTableHours">
                                {translate("fareGroups.fareTable.default", "Default")}
                            </div>
                            <div className="xtm-fareGroupEditor_fareTableFare">
                                {formatFareLabel(localization, detail.defaultFare)}
                            </div>
                        </div>
                        {sortedExceptions.map((row, index) => (
                            <div
                                key={`${row.startingHour}_${row.endingHour}_${index}`}
                                className="xtm-fareGroupEditor_fareTableRow"
                            >
                                <div className="xtm-fareGroupEditor_fareTableHours">
                                    {formatHours(row.startingHour, row.endingHour)}
                                </div>
                                <div className="xtm-fareGroupEditor_fareTableFare">
                                    {formatFareLabel(localization, row.fareValue)}
                                </div>
                            </div>
                        ))}
                    </div>
                </InfoSectionFoldout>
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
