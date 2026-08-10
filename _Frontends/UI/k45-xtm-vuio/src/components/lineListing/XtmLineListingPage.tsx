import { LineData, LineManagementService } from "#service/LineManagementService";
import translate from "#utility/translate";
import { replaceArgs, toVanillaEntity, VanillaComponentResolver } from "@klyte45/vuio-commons";
import engine from "cohtml/cohtml";
import { transport } from "cs2/bindings";
import { FocusDisabled } from "cs2/input";
import { Scrollable } from "cs2/ui";
import { useEffect, useMemo, useState } from "react";
import { LineItemCard } from "./LineItemCard";
import { TYPE_ORDER, TYPE_TO_ICONS } from "./lineListingTypes";
import "#styles/lineListing.scss";

function getNameFor(type: string, isCargo: boolean) {
    return engine.translate(isCargo ? `Transport.ROUTES[${type}]` : `Transport.LINES[${type}]`);
}

export const XtmLineListingPage = () => {
    const [linesList, setLinesList] = useState<LineData[]>([]);
    const [filterExclude, setFilterExclude] = useState<string[]>([]);
    const ToolButton = VanillaComponentResolver.instance.ToolButton;

    const reloadLines = (res: LineData[]) => {
        if (!Array.isArray(res)) {
            setLinesList([]);
            return;
        }
        const sorted = [...res].sort((a, b) => {
            const typeA = `${a.type}.${a.isCargo}`;
            const typeB = `${b.type}.${b.isCargo}`;
            if (typeA !== typeB) return TYPE_ORDER.indexOf(typeA) - TYPE_ORDER.indexOf(typeB);
            return a.routeNumber - b.routeNumber;
        });
        setLinesList(sorted);
    };

    useEffect(() => {
        const onLines = (x: LineData[]) => reloadLines(x);
        engine.whenReady.then(async () => {
            engine.on("k45::xtm.lineViewer.getCityLines->", onLines);
            LineManagementService.listLines().then(reloadLines);
        });
        return () => {
            engine.off("k45::xtm.lineViewer.getCityLines->");
        };
    }, []);

    const toggleFilterType = (type: string) => {
        setFilterExclude((prev) => {
            if (prev.includes(type)) return prev.filter((x) => x !== type);
            return [...prev, type];
        });
    };

    const visibleLines = useMemo(
        () => linesList.filter((x) => !filterExclude.includes(`${x.type}.${x.isCargo}`)),
        [linesList, filterExclude],
    );

    return (
        <div className="xtm-line-listing">
            <section className="filterRow">
                <FocusDisabled>
                    {Object.entries(TYPE_TO_ICONS).map(([key, icon]) => {
                        const [type, cargoFlag] = key.split(".");
                        const isCargo = cargoFlag === "true";
                        return (
                            <ToolButton
                                key={key}
                                src={icon}
                                selected={!filterExclude.includes(key)}
                                tooltip={getNameFor(type, isCargo)}
                                onSelect={() => toggleFilterType(key)}
                            />
                        );
                    })}
                    <div className="space" />
                    <button type="button" className="neutralBtn txt" onClick={() => setFilterExclude([])}>
                        {translate("lineList.showAll", "Show all")}
                    </button>
                    <button
                        type="button"
                        className="neutralBtn txt"
                        onClick={() => setFilterExclude(TYPE_ORDER.slice())}
                    >
                        {translate("lineList.hideAll", "Hide all")}
                    </button>
                    <button
                        type="button"
                        className="neutralBtn txt"
                        onClick={() => setFilterExclude(TYPE_ORDER.filter((x) => x.endsWith(".true")))}
                    >
                        {translate("lineList.passengerLines", "Passenger lines")}
                    </button>
                    <button
                        type="button"
                        className="neutralBtn txt"
                        onClick={() => setFilterExclude(TYPE_ORDER.filter((x) => x.endsWith(".false")))}
                    >
                        {translate("lineList.cargoRoutes", "Cargo routes")}
                    </button>
                </FocusDisabled>
                <div className="space" />
                <div className="linesCountLabel">
                    {replaceArgs(translate("lineList.linesCurrentFilterFormat", "{LINECOUNT} lines"), {
                        LINECOUNT: `${visibleLines.length}`,
                    })}
                </div>
            </section>
            <section className="LineList">
                <Scrollable className="scrollArea">
                    {visibleLines.flatMap((x, i, a) => [
                        i > 0 && (a[i - 1].type !== x.type || a[i - 1].isCargo !== x.isCargo) ? (
                            <div key={`sep_${i}`} className="typeSeparator" />
                        ) : null,
                        <LineItemCard
                            key={`${x.entity.Index}_${i}`}
                            lineData={x}
                            onClick={() => transport.selectLine(toVanillaEntity(x.entity))}
                        />,
                    ])}
                </Scrollable>
            </section>
        </div>
    );
};
