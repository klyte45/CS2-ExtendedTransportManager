import { LineDetails, StationData } from "#service/LineManagementService";
import { WEDestinationKeyframeType, WEDynamicBlindItem, WEIntegrationService } from "#service/WEIntegrationService";
import translate from "#utility/translate";
import { Cs2FormLine, Cs2Select, DefaultPanelScreen, Entity, GameScrollComponent, Input, nameToString, replaceArgs } from "@klyte45/euis-components";
import { useEffect, useState } from "react";
import './LineDetail_WriteEverywhere.scss'
import { ObjectTyped } from "object-typed";

type Props = {
    lineId: Entity;
    stops: LineDetails['Stops'],
};

enum BlindsState {
    Listing,
    Editing
}

const defaultKeyframe = { framesLength: 1, type: { value__: WEDestinationKeyframeType.RouteName } };

export const LineDetail_WriteEverywhere = ({ lineId, stops }: Props) => {

    const [state, setState] = useState(BlindsState.Listing);
    const [currentEditingIdx, setCurrentEditingIdx] = useState(0);
    const [currentData, setCurrentData] = useState<WEDynamicBlindItem[]>()
    const [indexedStops, setIndexedStops] = useState<Record<string, number>>({})

    const [editingData, setEditingData] = useState<WEDynamicBlindItem>();

    useEffect(() => {
        fetchData();
    }, [lineId])

    const fetchData = async () => {
        const data = await WEIntegrationService.getBlindsKeyframes(lineId);
        setCurrentData(data)
    }

    useEffect(() => {
        setIndexedStops(ObjectTyped.fromEntries(stops.map(x => [x.waypoint.Index.toFixed(0), x.position])))
    }, [stops])

    if (!currentData) return <>Loading...</>

    const subpage: Record<BlindsState, () => JSX.Element> = {
        [BlindsState.Listing]: () => <Listing blinds={currentData} onDelete={(x) => { setStep(undefined, x) }} onSelect={(x) => { setCurrentEditingIdx(x), setEditingData({ ...currentData[x] }), setState(BlindsState.Editing) }} stops={stops} />,
        [BlindsState.Editing]: () => <Editing editingData={editingData} setEditingData={setEditingData} stops={stops} lineId={lineId}></Editing>,
    }

    const actionButtons: Record<BlindsState, () => JSX.Element> = {
        [BlindsState.Listing]: () => <><button className="positiveBtn" onClick={() => {
            setStep({
                keyframes: [{ ...defaultKeyframe }],
                staticKeyframeIdx: 0
            })
        }}>{translate("weIntegrationBlinds.addStep")}</button>
            <div style={{ flexGrow: 1 }} />
            {WEIntegrationService.hasClipboard() && <button className="neutralBtn" onClick={() => WEIntegrationService.setBlindsKeyframes(lineId, WEIntegrationService.getClipboard(stops)).then(fetchData)}>{translate("weIntegrationBlinds.pasteFromClipboard")}</button>}
            <button className="neutralBtn" onClick={() => { WEIntegrationService.setClipboard(currentData, stops); fetchData() }}>{translate("weIntegrationBlinds.copyToClipboard")}</button>
        </>,
        [BlindsState.Editing]: () => <>
            <button className="positiveBtn" onClick={() => setStep(editingData, currentEditingIdx) && setState(BlindsState.Listing)}>{translate("weIntegrationBlinds.saveStep")}</button>
            <button className="negativeBtn" onClick={() => setState(BlindsState.Listing)}>{translate("weIntegrationBlinds.cancel")}</button>
        </>,
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

    return <DefaultPanelScreen buttonsRowContent={actionButtons[state]()} title={translate("weIntegrationBlinds.title")} subtitle={translate("weIntegrationBlinds.description")} size="h2" scrollable={state == BlindsState.Listing} offsets={{ top: 125 }}>
        {subpage[state]()}
    </DefaultPanelScreen>;
};

type ListingProps = {
    blinds: WEDynamicBlindItem[],
    onSelect(idx: number): void
    onDelete(idx: number): void
    stops: LineDetails['Stops']
}
const Listing = ({ blinds, onSelect, onDelete, stops }: ListingProps) => {
    return <>
        {
            blinds.map((x, i) => {
                const targetStop = stops.find(y => y.waypoint.Index == x.useUntilStop?.Index);
                return <Cs2FormLine key={i} className="weBlind_listItem"
                    title={`${i + 1}: ${replaceArgs(translate("weIntegrationBlinds.useUntil"), { stationName: targetStop ? `${nameToString(targetStop?.name)} (#${targetStop.index}, ${(targetStop.position * 100).toFixed(1)}%) ` : translate("weIntegrationBlinds.theEndOfLine") })}`}
                    subtitle={replaceArgs(translate("weIntegrationBlinds.sampleFormat"), {
                        sampleValue: x.keyframes[x.staticKeyframeIdx]?.sample,
                        sampleType: translate("weIntegrationBlinds.keyframeType." + WEDestinationKeyframeType[x.keyframes[x.staticKeyframeIdx]?.type.value__]),
                        keyframeCount: x.keyframes.length.toFixed(0)
                    })}
                >
                    <button className="neutralBtn" onClick={() => onSelect(i)}>{translate("weIntegrationBlinds.editStep")}</button>
                    {blinds.length > 1 && <button className="negativeBtn" onClick={() => onDelete(i)}>{translate("weIntegrationBlinds.removeStep")}</button>}
                </Cs2FormLine>;
            }
            )
        }
    </>
}
type EditingProps = {
    editingData: WEDynamicBlindItem,
    stops: LineDetails['Stops']
    setEditingData(x: WEDynamicBlindItem): void,
    lineId: Entity
}
const Editing = ({ setEditingData, editingData, stops, lineId }: EditingProps) => {
    const [options, setOptions] = useState<StationData[]>([]);
    useEffect(() => {
        setOptions(stops.concat([{} as any]));
    }, [stops])
    const optionsKeyframeType = ObjectTyped.entries(WEDestinationKeyframeType).filter(x => typeof x[1] == 'number').map(x => ({ value__: x[1] }));
    return !editingData ? null : <div className="we_editorPart">
        <Cs2FormLine title={translate("weIntegrationBlinds.useUntilStop")} ><Cs2Select
            value={!editingData.useUntilStop?.Index ? {} as StationData : options.find(x => x.waypoint?.Index == editingData.useUntilStop?.Index)}
            options={options}
            getOptionLabel={(x) => x.entity ? `#${x.index}: ${nameToString(x.name)}` : translate("weIntegrationBlinds.theEndOfLine")}
            getOptionValue={(x) => x?.entity?.Index.toFixed()}
            onChange={(x) => {
                editingData.useUntilStop = x.waypoint ?? { Index: 0, Version: 0 }
                setEditingData({ ...editingData });
            }}
        /></Cs2FormLine>
        <Cs2FormLine title={translate("weIntegrationBlinds.staticKeyframeIdx")} ><Cs2Select
            value={editingData.keyframes[editingData.staticKeyframeIdx]}
            options={editingData.keyframes}
            getOptionLabel={(x) => `#${editingData.keyframes.indexOf(x)}: ${translate("weIntegrationBlinds.keyframeType." + WEDestinationKeyframeType[x.type.value__])}, ${replaceArgs(translate("weIntegrationBlinds.framesNumberFmt"), { frames: x.framesLength.toFixed(0) })}`}
            getOptionValue={(x) => editingData.keyframes.indexOf(x).toFixed()}
            onChange={(x) => (editingData.staticKeyframeIdx = editingData.keyframes.indexOf(x)) && setEditingData({ ...editingData })}
        /></Cs2FormLine>
        <div className="we_keyframesEditor">
            <h3>{translate("weIntegrationBlinds.keyframesTitle")}</h3>
            <GameScrollComponent>
                {
                    editingData.keyframes.map((k, i) => {
                        const typeValue = k.type.value__;
                        return <div key={i} className="keyframeDataItem">
                            <div className="numberIdentifier">{i.toFixed(0).padStart(2, '0')}</div>
                            <div className="colType">
                                <Cs2Select
                                    value={k.type}
                                    options={optionsKeyframeType}
                                    getOptionLabel={(x) => translate("weIntegrationBlinds.keyframeType." + WEDestinationKeyframeType[x.value__])}
                                    getOptionValue={(x) => WEDestinationKeyframeType[x.value__]}
                                    onChange={(x) => (editingData.keyframes[i].type = x) && setEditingData({ ...editingData })}
                                />
                                <Input title={translate("weIntegrationBlinds.framesLblShort")}
                                    getValue={() => k.framesLength.toFixed()}
                                    isValid={(x) => parseInt(x) >= 0}
                                    onValueChanged={(x) => {
                                        editingData.keyframes[i].framesLength = parseInt(x);
                                        setEditingData({ ...editingData })
                                        return parseInt(x).toFixed(0);
                                    }} />
                            </div>
                            <div className="colExtraData">
                                {typeValue == WEDestinationKeyframeType.FixedString &&
                                    <Input title={translate("weIntegrationBlinds.fixedStringShort")}
                                        getValue={() => k.prefix}
                                        isValid={(x) => !!x}
                                        onValueChanged={(x) => {
                                            editingData.keyframes[i].prefix = x;
                                            setEditingData({ ...editingData })
                                            return x;
                                        }} />}
                                {[
                                    WEDestinationKeyframeType.RouteName,
                                    WEDestinationKeyframeType.RouteNumber,
                                    WEDestinationKeyframeType.EntityName,
                                    WEDestinationKeyframeType.NextStopSimple,
                                    WEDestinationKeyframeType.EntityNameOrDistrict,
                                ].includes(typeValue) && <>
                                        <Input title={translate("weIntegrationBlinds.prefixShort")}
                                            getValue={() => k.prefix}
                                            onValueChanged={(x) => {
                                                editingData.keyframes[i].prefix = x;
                                                setEditingData({ ...editingData })
                                                return x;
                                            }} />
                                        <Input title={translate("weIntegrationBlinds.suffixShort")}
                                            getValue={() => k.suffix}
                                            onValueChanged={(x) => {
                                                editingData.keyframes[i].suffix = x;
                                                setEditingData({ ...editingData })
                                                return x;
                                            }} />
                                    </>}
                            </div>
                        </div>
                    })
                }
                <button className="positiveBtn" onClick={() => {
                    editingData.keyframes.push({ ...defaultKeyframe });
                    setEditingData({ ...editingData });
                }}>{translate("weIntegrationBlinds.addKeyframe")}</button>
            </GameScrollComponent>
        </div>
    </div>
}






