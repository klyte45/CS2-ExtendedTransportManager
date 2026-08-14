import { OccupancyTimeChart } from "#components/charts/OccupancyTimeChart";
import { Unit } from "#enum/Unit";
import { LineData, StationData } from "#service/LineManagementService";
import { getStopHistoricalUsageDayAverage, getStopHistoricalUsageSeries } from "#utility/lineViewerUtils";
import translate from "#utility/translate";
import { nameToString, replaceArgs, VanillaComponentResolver } from "@klyte45/vuio-commons";
import { LocalizedNumber, useLocalization } from "cs2/l10n";
import { Panel, Portal } from "cs2/ui";
import { useMemo } from "react";
import { TlmLineFormatCmp } from "./TlmLineFormatCmp";
import "#styles/SegmentOccupancyPanel.scss";
import { getLineActivityClass } from "#components/mainWindow/mainWindowTypes";

export type SegmentOccupancySelection = {
    fromStop: StationData;
    toStop: StationData;
};

type Props = {
    line: LineData;
    fromStop: StationData;
    toStop: StationData;
    onClose: () => void;
};

export function SegmentOccupancyPanelCmp({ line, fromStop, toStop, onClose }: Props) {
    const locale = useLocalization();
    const PanelTitleBar = VanillaComponentResolver.instance.PanelTitleBar;
    const series = useMemo(() => getStopHistoricalUsageSeries(fromStop), [fromStop]);
    const dayAverage = useMemo(() => getStopHistoricalUsageDayAverage(fromStop), [fromStop]);

    const fromName = nameToString(fromStop.name) ?? "";
    const headingText = replaceArgs(
        translate("lineViewer.occupancyHeadingTo", "Vehicles heading to: {to}"),
        { to: nameToString(toStop.name) ?? "" },
    );

    const averageValue = LocalizedNumber.renderString(locale, {
        value: dayAverage * 100,
        unit: Unit.PercentageSingleFraction,
        signed: false,
    });

    const averageText = replaceArgs(
        translate("lineViewer.occupancyDayAverage", "Average occupancy through day: {value}"),
        { value: averageValue },
    );

    const header = (
        <PanelTitleBar className="k45_xtm_segmentOccupancyPanel_title" onCloseOverride={onClose}>
            <div className="k45_xtm_segmentOccupancyPanel_headerRow">
                <TlmLineFormatCmp
                    color={line.color}
                    type={line.type}
                    isCargo={line.isCargo}
                    text={line.xtmData?.Acronym || line.routeNumber.toFixed()}
                    activity={getLineActivityClass(line)}
                />
                <div className="k45_xtm_segmentOccupancyPanel_fromStop">{fromName}</div>
            </div>
        </PanelTitleBar>
    );

    return (
        <Portal>
            <div className="k45_xtm_segmentOccupancyPanel_anchor">
                <Panel
                    className="k45_xtm_segmentOccupancyPanel"
                    header={header}
                    draggable={true}
                    initialPosition={{ x: 0.65, y: 0.25 }}
                >
                    <div className="k45_xtm_segmentOccupancyPanel_body">
                        <div className="k45_xtm_segmentOccupancyPanel_headline">{headingText}</div>
                        <OccupancyTimeChart data={series} color={line.color} />
                        <div className="k45_xtm_segmentOccupancyPanel_footer">{averageText}</div>
                    </div>
                </Panel>
            </div>
        </Portal>
    );
}
