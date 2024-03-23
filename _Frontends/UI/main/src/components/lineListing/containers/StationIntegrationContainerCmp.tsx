import { TransportTypePriority } from "#enum/TransportType";
import { LineData, StationData, VehicleData } from "#service/LineManagementService";
import { ColorUtils, Entity, UnitSystem, getGameUnits, nameToString } from "@klyte45/euis-components";
import { CSSProperties, Component, ReactNode } from "react";
import { TlmLineFormatCmp } from "./TlmLineFormatCmp";


export class StationIntegrationContainerCmp extends Component<{
    station: StationData;
    getLineById: (e: number) => LineData;
    vehicles: VehicleData[];
    thisLineId: Entity
    setSelection: (e: Entity) => void;
    keyId: number;
    normalizedPosition: number;
    totalStationCount: number
}, { measureUnit?: UnitSystem; }> {

    constructor(props) {
        super(props);
        this.state = {};
    }
    private measureCallback = async () => this.setState({ measureUnit: (await getGameUnits()).unitSystem.value__ });
    componentDidMount() {
        engine.on("k45::xtm.common.onMeasureUnitsChanged", this.measureCallback);
        getGameUnits().then(async (x) => {
            this.setState({ measureUnit: x.unitSystem.value__ });
        });
    }
    override componentWillUnmount() {
        engine.off("k45::xtm.common.onMeasureUnitsChanged", this.measureCallback);
    }

    render(): ReactNode {
        const station = this.props.station;
        const linesToIntegrate = [...station.connectedLines.reduce((p, n) => {
            if (this.props.thisLineId.Index != n.line.Index) p.add(n.line.Index)
            return p;
        }, new Set<number>())].map(x => this.props.getLineById(x))
            .sort((a, b) => (TransportTypePriority.indexOf(a.type) - TransportTypePriority.indexOf(b.type)) || (a.routeNumber - b.routeNumber))
        if (linesToIntegrate.length == 0) return null;
        const colors = [...linesToIntegrate
            .reduce((p, n) => {
                p.add(n.color)
                return p;
            }, new Set<string>())]
        const stepEachColor = 100 / colors.length;
        return <div className="stationIntegrationContainer" style={{ top: (100 * this.props.normalizedPosition) + "%", minHeight: (100 / this.props.totalStationCount) + "%" }}       >
            <div className="lineStation">
                <div className="integrationLineCutted" style={colors.length == 1 || colors.length > 6 ? {
                    "--integrationLineColor": ColorUtils.getClampedColor(colors.length > 6 ? "#444444" : colors[0])
                } as CSSProperties : {
                    "--integrationBackgroundImage": `linear-gradient(to right, ${colors.flatMap((x, i, arr) => {
                        const targetColor = ColorUtils.getClampedColor(x);
                        const margin = 3;
                        return [
                            `transparent ${i * stepEachColor}%`,
                            `transparent ${i * stepEachColor + margin}%`,
                            `${targetColor} ${i * stepEachColor + margin}%`,
                            `${targetColor} ${(i + 1) * stepEachColor - margin}%`,
                            `transparent ${(i + 1) * stepEachColor - margin}%`,
                            `transparent ${(i + 1) * stepEachColor}%`
                        ]
                    }).join(", ")})`
                } as CSSProperties} />
                <div className="integrationStationBulletBG" />
                <div className="integrationStationBullet" />
                {<div className={`stationIntersectionsContainer ${linesToIntegrate.length > 4 ? "sz1" : ""}`}>
                    {linesToIntegrate.map((lineData, i) => {
                        return <div className="lineIntersection" key={i} data-tooltip={nameToString(lineData.name)} data-tootip-position="top left" onClick={() => this.props.setSelection(lineData.entity)} >
                            <TlmLineFormatCmp {...lineData} text={lineData.xtmData?.Acronym || lineData.routeNumber.toFixed()} />
                        </div>;
                    })}
                </div>}
            </div>
        </div>;
    }
}
