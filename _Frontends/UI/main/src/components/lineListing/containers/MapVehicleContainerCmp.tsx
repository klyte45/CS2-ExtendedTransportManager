import { VehicleData } from "#service/LineManagementService";
import { UnitSystem, getGameUnits } from "@klyte45/euis-components";
import { nameToString } from "@klyte45/euis-components";
import { CSSProperties, Component, ReactNode } from "react";


export class MapVehicleContainerCmp extends Component<{
    vehicle: VehicleData;
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
        const vehicle = this.props.vehicle;
        return <div className="vehicleContainer" style={{ top: (vehicle.normalizedPosition * 100) + "%", "--vehicleColor": "gray" } as CSSProperties}>
            <div className="vehicle" style={{ zIndex: (vehicle.normalizedPosition * 100) + 2000 } as CSSProperties} >
                <div className="vehicleNeedle" ><div className="painting" /></div>
                <div className="vehicleName">{nameToString(vehicle.name) + " " + vehicle.entity.Index}</div>
                <div className="vehicleFill">{(vehicle.cargo / vehicle.capacity * 100).toFixed() + "%"}</div>
            </div>
        </div>;
    }
}
