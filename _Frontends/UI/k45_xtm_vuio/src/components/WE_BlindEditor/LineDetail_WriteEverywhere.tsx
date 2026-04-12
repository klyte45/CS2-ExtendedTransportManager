import { LineDetails, StationData } from "#service/LineManagementService";
import { WEDestinationKeyframeType, WEDynamicBlindItem, WEIntegrationService } from "#service/WEIntegrationService";
import translate from "#utility/translate";
import { ReactNode, memo, useEffect, useState } from "react";
import './LineDetail_WriteEverywhere.scss'
import { ObjectTyped } from "object-typed";
import { Entity, LocElementType, nameToString, replaceArgs, VanillaComponentResolver, VanillaWidgets } from "@klyte45/vuio-commons";
import { Dropdown, Panel, Scrollable } from "cs2/ui";
import { LocalizedString, useLocalization } from "cs2/l10n";
import { FocusDisabled } from "cs2/input";

type Props = {
    lineId: Entity;
    stops: LineDetails['Stops'],
};

enum BlindsState {
    Listing,
    Editing
}

const defaultKeyframe = { framesLength: 1, type: { value__: WEDestinationKeyframeType.RouteName } };

export const LineDetail_WriteEverywhere = memo(({ lineId, stops }: Props) => {

    const [state, setState] = useState(BlindsState.Listing);
    const [currentEditingIdx, setCurrentEditingIdx] = useState(0);
    const [currentData, setCurrentData] = useState<WEDynamicBlindItem[]>()
    const [indexedStops, setIndexedStops] = useState<Record<string, number>>({})

    const [editingData, setEditingData] = useState<WEDynamicBlindItem>();

    useEffect(() => {
        fetchData();
    }, [lineId.Index])

    const fetchData = async () => {
        const data = await WEIntegrationService.getBlindsKeyframes(lineId);
        setCurrentData(data)
    }

    useEffect(() => {
        setIndexedStops(ObjectTyped.fromEntries(stops.map(x => [x.waypoint.Index.toFixed(0), x.position])))
    }, [lineId.Index])

    if (!currentData) return <>Loading...</>

    const actionsSectionTheme = VanillaComponentResolver.instance.actionsSectionTheme;

    let subpage: ReactNode;
    switch (state) {
        case BlindsState.Listing:
            subpage = <ListingItem
                blinds={currentData} onDelete={(x) => { setStep(undefined, x) }}
                onSelect={(x) => { setCurrentEditingIdx(x), setEditingData({ ...currentData[x] }), setState(BlindsState.Editing) }} stops={stops}
                onMoveUp={(x) => swapAndSave(x, x - 1)} onMoveDown={(x) => swapAndSave(x, x + 1)}
            />
            break;
        case BlindsState.Editing:
            subpage = <>{editingData && <Editing editingData={editingData} setEditingData={setEditingData} stops={stops} ></Editing>}</>
            break;
    }

    let actionButtons: ReactNode
    switch (state) {
        case BlindsState.Listing:
            actionButtons = <FocusDisabled>
                <div className={actionsSectionTheme.actionsSection}>
                    <VanillaComponentResolver.instance.ActionSectionButton src="coui://uil/Standard/Plus.svg" onClick={() => setStep({ keyframes: [{ ...defaultKeyframe }], staticKeyframeIdx: 0 })} tooltip={translate("weIntegrationBlinds.addStep")} />
                    <div style={{ flexGrow: 1 }} />
                    <VanillaComponentResolver.instance.ActionSectionButton src="coui://uil/Standard/ArrowCircularLeft.svg" onClick={() => WEIntegrationService.setBlindsKeyframes(lineId, WEIntegrationService.getDefault(stops)).then(fetchData)} tooltip={translate("weIntegrationBlinds.resetDefaults")} />
                    <div style={{ width: "10rem" }} />
                    <VanillaComponentResolver.instance.ActionSectionButton src="coui://uil/Standard/RectanglePaste.svg" onClick={() => WEIntegrationService.setBlindsKeyframes(lineId, WEIntegrationService.getClipboard(stops)).then(fetchData)} tooltip={translate("weIntegrationBlinds.pasteFromClipboard")} disabled={!WEIntegrationService.hasClipboard()} />
                    <VanillaComponentResolver.instance.ActionSectionButton onClick={() => { WEIntegrationService.setClipboard(currentData, stops); fetchData() }} src="coui://uil/Standard/RectangleCopy.svg" tooltip={translate("weIntegrationBlinds.copyToClipboard")} />
                </div>
            </FocusDisabled>
            break;
        case BlindsState.Editing:
            actionButtons = <FocusDisabled>
                <div className={actionsSectionTheme.actionsSection}>
                    <VanillaComponentResolver.instance.ActionSectionButton src="coui://uil/Standard/Plus.svg" onClick={() => {
                        let modifiedData = editingData!;
                        modifiedData.keyframes.push({ ...defaultKeyframe });
                        setEditingData({ ...modifiedData });
                    }} tooltip={translate("weIntegrationBlinds.addKeyframe")} />
                    <div style={{ flexGrow: 1 }} />
                    <VanillaComponentResolver.instance.ActionSectionButton src="coui://uil/Standard/XClose.svg" onClick={() => setState(BlindsState.Listing)} tooltip={translate("weIntegrationBlinds.cancel")} />
                    <VanillaComponentResolver.instance.ActionSectionButton src="coui://uil/Standard/Checkmark.svg" onClick={async () => { await setStep(editingData, currentEditingIdx); setState(BlindsState.Listing); }} tooltip={translate("weIntegrationBlinds.saveStep")} />
                </div>
            </FocusDisabled>
            break;
    }

    const swapAndSave = async (idxA: number, idxB: number) => {
        const modifiedData = [...currentData];
        const temp = modifiedData[idxA];
        modifiedData[idxA] = modifiedData[idxB];
        modifiedData[idxB] = temp;
        await WEIntegrationService.setBlindsKeyframes(lineId, modifiedData);
        await fetchData();
    }

    const setStep = async (newStep?: WEDynamicBlindItem, oldToRemove: number = -1) => {
        let modifiedData = currentData;
        if (oldToRemove >= 0 && oldToRemove < modifiedData.length) {
            if (newStep) modifiedData.splice(oldToRemove, 1, newStep)
            else modifiedData.splice(oldToRemove, 1)
        } else if (newStep) {
            modifiedData.push(newStep)
        }
        modifiedData = modifiedData.sort((a, b) => (a.useUntilStop?.Index ? indexedStops[a.useUntilStop.Index] : 1) - (b.useUntilStop?.Index ? indexedStops[b.useUntilStop.Index] : 1))
        await WEIntegrationService.setBlindsKeyframes(lineId, modifiedData);
        await fetchData();
        setEditingData(undefined);
    }

    return <Panel draggable header={translate("weIntegrationBlinds.title")} style={{ width: "600rem", maxHeight: "80vh" }} initialPosition={{ x: 1 - 180 / window.innerWidth, y: 180 / window.innerHeight }} footer={actionButtons}>
        {subpage}
    </Panel>
}, (prev, next) => prev.lineId.Index === next.lineId.Index);

type ListingProps = {
    blinds: WEDynamicBlindItem[],
    onSelect(idx: number): void
    onDelete(idx: number): void
    stops: LineDetails['Stops']
    onMoveUp(idx: number): void
    onMoveDown(idx: number): void
}
const ListingItem = ({ blinds, onSelect, onDelete, stops, onMoveUp, onMoveDown }: ListingProps) => {
    return <>
        {
            blinds.map((x, i) => {
                const targetStop = stops.find(y => y.waypoint.Index == x.useUntilStop?.Index);
                return <div key={i} className="weBlind_listItem">
                    <div className="preleft">
                        <VanillaComponentResolver.instance.ToolButton src="coui://uil/Standard/ArrowUp.svg" onSelect={() => onMoveUp(i)} tooltip={translate("weIntegrationBlinds.moveUp")} disabled={i <= 0} />
                        <VanillaComponentResolver.instance.ToolButton onSelect={() => { onMoveDown(i) }} src="coui://uil/Standard/ArrowDown.svg" tooltip={translate("weIntegrationBlinds.moveDown")} disabled={i >= blinds.length - 1} />
                    </div>
                    <div className="left">
                        <div className="title">
                            {`${i + 1}: ${replaceArgs(translate("weIntegrationBlinds.useUntil"), { stationName: targetStop ? `${nameToString(targetStop?.name)} (#${targetStop.index}, ${(targetStop.position * 100).toFixed(1)}%) ` : translate("weIntegrationBlinds.theEndOfLine") })}`}
                        </div>
                        {replaceArgs(translate("weIntegrationBlinds.sampleFormat"), {
                            sampleValue: x.keyframes[x.staticKeyframeIdx]?.sample,
                            sampleType: translate("weIntegrationBlinds.keyframeType." + WEDestinationKeyframeType[x.keyframes[x.staticKeyframeIdx]?.type.value__]),
                            keyframeCount: x.keyframes.length.toFixed(0)
                        }).split(" - ").map((part, idx) => <div key={idx} className="subtitle">{part}</div>)}

                    </div>
                    <div className="right">
                        <VanillaComponentResolver.instance.ToolButton src="coui://uil/Standard/PencilPaper.svg" onSelect={() => onSelect(i)} tooltip={translate("weIntegrationBlinds.editStep")} />
                        {blinds.length > 1 && <VanillaComponentResolver.instance.ToolButton src="coui://uil/Standard/XClose.svg" onSelect={() => onDelete(i)} tooltip={translate("weIntegrationBlinds.removeStep")} />}
                    </div>
                </div>;
            }
            )
        }
    </>
}
type EditingProps = {
    editingData: WEDynamicBlindItem,
    stops: LineDetails['Stops']
    setEditingData(x: WEDynamicBlindItem): void,
}
const Editing = ({ setEditingData, editingData, stops }: EditingProps) => {
    const [options, setOptions] = useState<StationData[]>([]);

    useEffect(() => {
        setOptions(stops.concat([{} as any]));
    }, [stops])

    const EditorItemRow = VanillaWidgets.instance.EditorItemRow;
    const NumberDropdownField = VanillaWidgets.instance.DropdownField<number>();
    const KeyframeTypeDropdownField = VanillaWidgets.instance.DropdownField<WEDestinationKeyframeType>();
    const IntInput = VanillaWidgets.instance.IntInputField;
    const StringInput = VanillaWidgets.instance.StringInputRow;

    const optionsKeyframeType = ObjectTyped.entries(WEDestinationKeyframeType).filter(x => typeof x[1] == 'number').map(x => ({ value__: x[1] }));
    if (!editingData) return null;
    const onMoveUp = (idx: number) => {
        if (idx <= 0) return;
        const modifiedData = { ...editingData };
        const temp = modifiedData.keyframes[idx];
        modifiedData.keyframes[idx] = modifiedData.keyframes[idx - 1];
        modifiedData.keyframes[idx - 1] = temp;
        setEditingData(modifiedData);
    }

    const onMoveDown = (idx: number) => {
        if (idx >= editingData.keyframes.length - 1) return;
        const modifiedData = { ...editingData };
        const temp = modifiedData.keyframes[idx];
        modifiedData.keyframes[idx] = modifiedData.keyframes[idx + 1];
        modifiedData.keyframes[idx + 1] = temp;
        setEditingData(modifiedData);
    }

    return <div className="we_editorPart">
        <EditorItemRow label={translate("weIntegrationBlinds.useUntilStop")} >
            <NumberDropdownField items={options.map(x => ({
                value: x.waypoint?.Index ?? 0,
                displayName: { value: x.waypoint ? `#${x.index}: ${nameToString(x.name)}` : translate("weIntegrationBlinds.theEndOfLine"), __Type: LocElementType.String },
            }))} value={editingData.useUntilStop?.Index ?? 0} onChange={y => {
                editingData.useUntilStop = options.find(x => x.waypoint?.Index === y)?.waypoint ?? { Index: 0, Version: 0 };
                setEditingData({ ...editingData });
            }} />
        </EditorItemRow>

        <EditorItemRow label={translate("weIntegrationBlinds.staticKeyframeIdx")} >
            <NumberDropdownField items={editingData.keyframes.map((x, i) => ({
                value: i,
                displayName: { value: `#${i}: ${translate("weIntegrationBlinds.keyframeType." + WEDestinationKeyframeType[x.type.value__])}, ${replaceArgs(translate("weIntegrationBlinds.framesNumberFmt"), { frames: x.framesLength.toFixed(0) })}`, __Type: LocElementType.String },
            }))} value={editingData.staticKeyframeIdx} onChange={x => {
                editingData.staticKeyframeIdx = x ?? 0;
                setEditingData({ ...editingData });
            }} />
        </EditorItemRow>
        <h4>{translate("weIntegrationBlinds.keyframesTitle")}</h4>

        <Scrollable className="we_keyframesEditor">
            {
                editingData.keyframes.map((k, i) => {
                    const typeValue = k.type.value__;
                    return <div key={i} className={"keyframeDataItem" + (i % 2 == 1 ? " odd" : "")}>
                        <div className="preleft">
                            <VanillaComponentResolver.instance.ToolButton src="coui://uil/Standard/ArrowUp.svg" onSelect={() => onMoveUp(i)} tooltip={translate("weIntegrationBlinds.moveUp")} disabled={i <= 0} />
                            <VanillaComponentResolver.instance.ToolButton onSelect={() => { onMoveDown(i) }} src="coui://uil/Standard/ArrowDown.svg" tooltip={translate("weIntegrationBlinds.moveDown")} disabled={i >= editingData.keyframes.length - 1} />
                        </div>
                        <div className="numberIdentifier">{i.toFixed(0).padStart(2, '0')}</div>
                        <div className="colType">
                            <div className="heading">

                                <KeyframeTypeDropdownField className="keyframeDD" items={optionsKeyframeType.map(x => ({
                                    value: x.value__,
                                    displayName: { value: translate("weIntegrationBlinds.keyframeType." + WEDestinationKeyframeType[x.value__]), __Type: LocElementType.String }
                                }))}
                                    value={k.type.value__}
                                    onChange={(x) => (editingData.keyframes[i].type = { value__: x }) && setEditingData({ ...editingData })}
                                />

                                {editingData.keyframes.length > 1 && <VanillaComponentResolver.instance.ToolButton src="coui://uil/Standard/Minus.svg" onSelect={() => {
                                    editingData.keyframes.splice(i, 1);
                                    setEditingData({ ...editingData });
                                }} tooltip={translate("weIntegrationBlinds.deleteStep")} />}
                            </div>

                            <IntInput label={translate("weIntegrationBlinds.framesLblShort")}
                                value={k.framesLength}
                                min={0}
                                onChange={(x) => {
                                    editingData.keyframes[i].framesLength = x;
                                    setEditingData({ ...editingData })
                                    return x;
                                }} />


                        </div>
                        <div className="colExtraData">
                            {typeValue == WEDestinationKeyframeType.FixedString &&
                                <StringInput label={translate("weIntegrationBlinds.fixedStringShort")}
                                    value={k.prefix || ""}
                                    onChange={(x) => {
                                        editingData.keyframes[i].prefix = x;
                                        setEditingData({ ...editingData })
                                        return x;
                                    }
                                    }
                                    maxLength={400}
                                />}
                            {[
                                WEDestinationKeyframeType.RouteName,
                                WEDestinationKeyframeType.RouteNumber,
                                WEDestinationKeyframeType.EntityName,
                                WEDestinationKeyframeType.NextStopSimple,
                                WEDestinationKeyframeType.EntityNameOrDistrict,
                            ].includes(typeValue) && <>
                                    <StringInput label={translate("weIntegrationBlinds.prefixShort")}
                                        value={k.prefix || ""}
                                        onChange={(x) => {
                                            editingData.keyframes[i].prefix = x;
                                            setEditingData({ ...editingData })
                                            return x;
                                        }
                                        }
                                        maxLength={400}
                                    />
                                    <StringInput label={translate("weIntegrationBlinds.suffixShort")}
                                        value={k.suffix || ""}
                                        onChange={(x) => {
                                            editingData.keyframes[i].suffix = x;
                                            setEditingData({ ...editingData })
                                            return x;
                                        }} />
                                </>}
                        </div>
                    </div>
                })
            }
        </Scrollable>

    </div>
}






