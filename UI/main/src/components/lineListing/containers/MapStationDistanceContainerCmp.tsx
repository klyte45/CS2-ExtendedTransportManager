import { MeasureUnit, metersTo } from "#utility/MeasureUnitsUtils";
import { replaceArgs } from "#utility/name.utils";
import { CSSProperties, Component, ReactNode } from "react";
import { SegmentData, StationData } from "../LineDetailCmp";


export class MapStationDistanceContainerCmp extends Component<{
    segments: SegmentData[];
    stop: StationData;
    nextStop: StationData;
    normalizedPosition: number;
}, { measureUnit?: MeasureUnit; }> {

    constructor(props) {
        super(props);
        this.state = {};
    }
    private measureCallback = async () => this.setState({ measureUnit: await engine.call("k45::xtm.common.getMeasureUnits") });
    componentDidMount() {
        engine.on("k45::xtm.common.onMeasureUnitsChanged", this.measureCallback);
        engine.call("k45::xtm.common.getMeasureUnits").then(async (x) => {
            this.setState({ measureUnit: x });
        });
    }
    override componentWillUnmount() {
        engine.off("k45::xtm.common.onMeasureUnitsChanged", this.measureCallback);
    }

    render(): ReactNode {
        if (!isFinite(this.state.measureUnit)) return null;
        const thisStop = this.props.stop;
        const nextStop = this.props.nextStop;
        const refNextStopPos = nextStop.position < thisStop.position ? 1 + nextStop.position : nextStop.position;
        const totalDistanceSegments = this.props.segments.filter(x => x.end > thisStop.position && x.start < refNextStopPos);
        const val = metersTo(totalDistanceSegments.reduce((p, n) => p + n.sizeMeters, 0), this.state.measureUnit);
        const nextVehicleDistanceFmt = replaceArgs(engine.translate(val[0]), { ...val[1], SIGN: "" }).trim();
        let topOffset: CSSProperties;
        topOffset = { top: (100 * this.props.normalizedPosition) + "%" }
        let waypointsText = "";
        if (totalDistanceSegments.length > 1) {
            waypointsText = `(${totalDistanceSegments.length - 1}wp) - `
        }

        return <div className="stationDistanceContainer" style={topOffset}>
            <div className="distanceLbl">{waypointsText + nextVehicleDistanceFmt}</div>
        </div>;
    }
}
