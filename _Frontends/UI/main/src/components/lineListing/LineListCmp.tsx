import { LineData, LineManagementService, MapViewerOptions } from "#service/LineManagementService";
import { ColorUtils, DefaultPanelScreen, Entity, GameScrollComponent, NameCustom, NameFormatted, NameType, SimpleInput, UnitSettings, getGameUnits, metersTo, nameToString, replaceArgs, translateUnitResult } from "@klyte45/euis-components";
import { Component, useEffect, useState } from "react";
import { LineDetailCmp } from "./LineDetailCmp";
import { TlmLineFormatCmp } from "./containers/TlmLineFormatCmp";
import "#styles/LineList.scss"
import translate from "#utility/translate";
import { TransportType } from "#enum/TransportType";


const TypeToIcons = {
    [`${TransportType.Bus}.false`]: "assetdb://gameui/Media/Game/Icons/BusLine.svg",
    [`${TransportType.Tram}.false`]: "assetdb://gameui/Media/Game/Icons/TramLine.svg",
    [`${TransportType.Subway}.false`]: "assetdb://gameui/Media/Game/Icons/SubwayLine.svg",
    [`${TransportType.Train}.false`]: "assetdb://gameui/Media/Game/Icons/PassengerTrainLine.svg",
    [`${TransportType.Ship}.false`]: "assetdb://gameui/Media/Game/Icons/PassengerShipLine.svg",
    [`${TransportType.Ferry}.false`]: "assetdb://gameui/Media/Game/Icons/PassengerShipLine.svg",
    [`${TransportType.Airplane}.false`]: "assetdb://gameui/Media/Game/Icons/PassengerAirplaneLine.svg",
    [`${TransportType.Train}.true`]: "assetdb://gameui/Media/Game/Icons/CargoTrainLine.svg",
    [`${TransportType.Ship}.true`]: "assetdb://gameui/Media/Game/Icons/CargoShipLine.svg",
    [`${TransportType.Airplane}.true`]: "assetdb://gameui/Media/Game/Icons/CargoAirplaneLine.svg",
}

export const LineListCmp = () => {
    const [linesList, setLinesList] = useState<LineData[]>([]);
    const [indexedLineList, setIndexedLineList] = useState<Record<string, LineData>>({});
    const [selectedLine, setSelectedLine] = useState<Entity>();
    const [unitsData, setUnitsData] = useState<UnitSettings>();
    const [filterExclude, setFilterExclude] = useState<string[]>([]);
    const [mapViewOptions, setMapViewOptions] = useState<MapViewerOptions>({
        showDistricts: true,
        showDistances: true,
        showVehicles: false,
        showIntegrations: true,
        useWhiteBackground: false,
        useHalfTripIfSimetric: true
    });

    useEffect(() => {
        engine.whenReady.then(async () => {
            engine.on("k45::xtm.lineViewer.getCityLines->", async (x) => {
                getGameUnits().then(setUnitsData)
                reloadLines(x);
            });
        })
        engine.call("k45::xtm.lineViewer.getCityLines", true)
        return () => {
            engine.off("k45::xtm.lineViewer.getCityLines->");
        }
    }, [])

    const reloadLines = async (res: LineData[]) => {
        const refOrder = Object.keys(TypeToIcons);
        const lineList = res.sort((a, b) => {
            const typeA = `${a.type}.${a.isCargo}`
            const typeB = `${b.type}.${b.isCargo}`

            if (typeA != typeB) return refOrder.indexOf(typeA) - refOrder.indexOf(typeB);
            return a.routeNumber - b.routeNumber
        });
        setLinesList(lineList)
        setIndexedLineList(lineList.reduce((p, n) => {
            p[n.entity.Index.toFixed(0)] = n;
            return p;
        }, {}));
    }

    function toggleFilterType(type: string) {
        let newVal = filterExclude.filter(x => x != type);
        if (newVal.length == filterExclude.length) {
            newVal.push(type);
        }
        setFilterExclude(newVal)
    }
    function getLineById(x: number): LineData {
        return indexedLineList[x.toFixed(0)];
    }

    if (selectedLine) {
        return <><LineDetailCmp
            mapViewOptions={mapViewOptions}
            setMapViewOptions={(x) => setMapViewOptions(x)}
            initialCurrentLine={selectedLine}
            onBack={() => { setSelectedLine(undefined); engine.call("k45::xtm.lineViewer.getCityLines", true) }}
            getLineById={(x) => getLineById(x)}
            onForceReload={() => engine.call("k45::xtm.lineViewer.getCityLines", true)}
        /></>
    }

    return <DefaultPanelScreen title={translate("lineList.title")} subtitle={translate("lineList.subtitle")}>
        <section style={{ position: "absolute", top: 0, left: 0, right: 0, height: 50 }} className="filterRow">
            {
                Object.entries(TypeToIcons).map(x => {
                    let splittedType = x[0].split(".")
                    let type = splittedType[0];
                    let isCargo = splittedType[1] == "true";
                    return <button key={x[0]} className={filterExclude.includes(x[0]) ? "unselected" : ""} onClick={() => toggleFilterType(x[0])}>
                        <img src={x[1]} data-tooltip={getNameFor(type, isCargo)} />
                    </button>
                })
            }
            <div className="space" />
            <button className="txt" onClick={() => setFilterExclude([])}>{translate("lineList.showAll")}</button>
            <button className="txt" onClick={() => setFilterExclude(Object.keys(TypeToIcons))}>{translate("lineList.hideAll")}</button>
            <button className="txt" onClick={() => setFilterExclude(Object.keys(TypeToIcons).filter(x => x.endsWith(".true")))}>{translate("lineList.passengerLines")}</button>
            <button className="txt" onClick={() => setFilterExclude(Object.keys(TypeToIcons).filter(x => x.endsWith(".false")))}>{translate("lineList.cargoRoutes")}</button>
            <button className="txt" onClick={() => engine.call("k45::xtm.lineViewer.getCityLines", true)}>{translate("lineList.refresh")}</button>
            <div className="space" />
            <div className="righter">
                {replaceArgs(translate("lineList.linesCurrentFilterFormat"), { LINECOUNT: `${linesList.filter(x => !filterExclude.includes(`${x.type}.${x.isCargo}`)).length}` })}
            </div>
        </section>
        <section style={{ position: "absolute", top: 50, left: 0, right: 0, bottom: 0 }} className="LineList">
            <GameScrollComponent>
                {linesList.filter(x => !filterExclude.includes(`${x.type}.${x.isCargo}`)).map((x, i) =>
                    <LineItemContainer onClick={() => setSelectedLine(x.entity)} lineData={x} key={i} unitsData={unitsData} />
                )}
            </GameScrollComponent>
        </section>
    </DefaultPanelScreen>;
}


function getNameFor(type: string, isCargo: boolean) {
    return nameToString({
        nameId: isCargo ? `Transport.ROUTES[${type}]` : `Transport.LINES[${type}]`,
        __Type: NameType.Localized
    })
}

type LineItemContainerProps = {
    lineData: LineData,
    onClick(): void,
    unitsData?: UnitSettings
}


const LineItemContainer = ({ lineData: x, onClick, unitsData }: LineItemContainerProps) => {
    const typeIndex = `${x.type}.${x.isCargo}`;
    const fontColor = ColorUtils.toRGBA(ColorUtils.getContrastColorFor(ColorUtils.toColor01(x.color)));
    const effectiveIdentifier = x.xtmData?.Acronym || x.routeNumber.toFixed();

    return <div className="BgItem">
        <div onClick={onClick} className="lineAcronym" style={{
            "--xtm-line-color": ColorUtils.getClampedColor(x.color),
            "--xtm-font-color": fontColor,
            "--xtm-game-icon": `url(${TypeToIcons[typeIndex]})`
        } as any}>
            <div className="text">{effectiveIdentifier}</div>
            <TlmLineFormatCmp className="icon" {...x} borderWidth="2px" contentOverride={<div className="gameIcon"></div>} />
        </div>
        <div className="lineName">{nameToString(x.name)}</div>
        <div className="lineType">{getNameFor(x.type, x.isCargo)}</div>
        <div className="lineLength">{translateUnitResult(metersTo(x.length, unitsData?.unitSystem?.value__ ?? 0))}</div>
        <div className="lineVehicles">{`${x.vehicles} ${nameToString({
            nameId: `Transport.LEGEND_VEHICLES[${x.type}]`,
            __Type: NameType.Localized
        })}`}</div>

    </div>;
}