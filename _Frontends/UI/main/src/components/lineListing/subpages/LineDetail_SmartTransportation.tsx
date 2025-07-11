import { LineDetails, LineData } from "#service/LineManagementService";
import { STIntegrationService } from "#service/STIntegrationService";
import translate from "#utility/translate";
import { DefaultPanelScreen, Cs2FormLine, UnitSystem, Cs2Select } from "@klyte45/euis-components";
import useAsyncMemo from "@klyte45/euis-components/src/utility/useAsyncMemo";
import { useMemo, useState } from "react";

type LineDetail_SmartTransportationProps = {
    lineDetails: LineDetails;
};
export function LineDetail_SmartTransportation({ lineDetails }: LineDetail_SmartTransportationProps): JSX.Element {

    const [buildIdx, setBuildIdx] = useState(0);

    const rulesAvailable = useAsyncMemo(async () => {
        return await STIntegrationService.listAvailableRouteRules(lineDetails.LineData.entity)
    }, [lineDetails]);

    const currentRule = useAsyncMemo(async () => {
        return STIntegrationService.getRouteRule(lineDetails.LineData.entity)
    }, [lineDetails, buildIdx]);


    return <DefaultPanelScreen title={translate("lineViewer.stIntegration")} size="h2">
        <Cs2FormLine title={translate("lineViewer.stIntegration.routeRule")}>
            <Cs2Select
                options={rulesAvailable || []}
                getOptionLabel={(x) => x.RouteRuleName}
                getOptionValue={(x) => x.RouteRuleId.toString()}
                onChange={(x) => STIntegrationService.setRouteRule(lineDetails.LineData.entity, x.RouteRuleId).then(() => setBuildIdx((x) => x + 1))}
                value={currentRule || null}
            />
        </Cs2FormLine>
    </DefaultPanelScreen>;
}
