import translate from "#utility/translate";
import {
    FareGroupHourExceptionDto,
    FareTicketSliderBounds,
} from "#service/FareGroupService";
import { replaceArgs, VanillaComponentResolver, VanillaWidgets } from "@klyte45/vuio-commons";
import { FocusDisabled } from "cs2/input";
import { Scrollable } from "cs2/ui";
import {
    firstFreeExceptionSlot,
    findExceptionOverlapError,
    hasFreeExceptionSlot,
    MAX_FARE_EXCEPTIONS,
} from "./fareGroupUtils";

const REMOVE_ICON = "coui://uil/Standard/XClose.svg";

type Props = {
    exceptions: FareGroupHourExceptionDto[];
    defaultFare: number;
    bounds: FareTicketSliderBounds;
    onChange: (exceptions: FareGroupHourExceptionDto[]) => void;
};

export function FareGroupExceptionList({ exceptions, defaultFare, bounds, onChange }: Props) {
    const ToolButton = VanillaComponentResolver.instance.ToolButton;
    const IntInput = VanillaComponentResolver.instance.IntInput;
    const EditorItemRowNoFocus = VanillaWidgets.instance.EditorItemRowNoFocus;
    const editorModule = VanillaWidgets.instance.editorItemModule;
    const canAdd = hasFreeExceptionSlot(exceptions);
    const overlapError = findExceptionOverlapError(exceptions);

    const updateAt = (index: number, patch: Partial<FareGroupHourExceptionDto>) => {
        const next = exceptions.map((row, i) => (i === index ? { ...row, ...patch } : row));
        onChange(next);
    };

    const removeAt = (index: number) => {
        onChange(exceptions.filter((_, i) => i !== index));
    };

    const addException = () => {
        const slot = firstFreeExceptionSlot(exceptions, defaultFare);
        if (!slot) return;
        onChange([...exceptions, slot]);
    };

    return (
        <div className="xtm-fareGroupExceptions">
            <div className="xtm-fareGroupExceptions_title">
                {translate("fareGroups.exceptions.title", "Hour exceptions")}
            </div>
            <div className="xtm-fareGroupExceptions_body">
                <Scrollable className="xtm-fareGroupExceptions_scroll">
                    {exceptions.length === 0 ? (
                        <div className="xtm-fareGroupExceptions_empty">
                            {translate("fareGroups.exceptions.empty", "No exceptions")}
                        </div>
                    ) : (
                        exceptions.map((row, index) => (
                            <div key={index} className="xtm-fareGroupExceptions_row">
                                <EditorItemRowNoFocus
                                    label={translate("fareGroups.exceptions.startHour", "Start")}
                                >
                                    <IntInput
                                        className={editorModule.input}
                                        value={row.startingHour}
                                        min={0}
                                        max={23}
                                        onChange={(v) => updateAt(index, { startingHour: v })}
                                        focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                                    />
                                </EditorItemRowNoFocus>
                                <EditorItemRowNoFocus
                                    label={translate("fareGroups.exceptions.endHour", "End")}
                                >
                                    <IntInput
                                        className={editorModule.input}
                                        value={row.endingHour}
                                        min={0}
                                        max={23}
                                        onChange={(v) => updateAt(index, { endingHour: v })}
                                        focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                                    />
                                </EditorItemRowNoFocus>
                                <EditorItemRowNoFocus
                                    label={translate("fareGroups.exceptions.fare", "Fare")}
                                >
                                    <IntInput
                                        className={editorModule.input}
                                        value={Math.round(row.fareValue)}
                                        min={0}
                                        max={Math.round(bounds.max)}
                                        onChange={(v) => updateAt(index, { fareValue: v })}
                                        focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                                    />
                                </EditorItemRowNoFocus>
                                <FocusDisabled>
                                    <ToolButton
                                        src={REMOVE_ICON}
                                        selected={false}
                                        tooltip={translate(
                                            "fareGroups.exceptions.remove",
                                            "Remove exception",
                                        )}
                                        onSelect={() => removeAt(index)}
                                        focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                                    />
                                </FocusDisabled>
                            </div>
                        ))
                    )}
                </Scrollable>
            </div>
            {overlapError && (
                <div className="xtm-fareGroupExceptions_error">
                    {overlapError === "max"
                        ? replaceArgs(
                            translate(
                                "fareGroups.exceptions.errorMax",
                                "Maximum of {count} exceptions",
                            ),
                            { count: String(MAX_FARE_EXCEPTIONS) },
                        )
                        : overlapError === "overlap"
                            ? translate(
                                "fareGroups.exceptions.errorOverlap",
                                "Exception hours must not overlap",
                            )
                            : translate(
                                "fareGroups.exceptions.errorInvalid",
                                "Invalid hour range",
                            )}
                </div>
            )}
            <button
                type="button"
                className="neutralBtn txt xtm-fareGroupExceptions_add"
                disabled={!canAdd}
                onClick={addException}
            >
                {translate("fareGroups.exceptions.add", "Add exception")}
            </button>
        </div>
    );
}
