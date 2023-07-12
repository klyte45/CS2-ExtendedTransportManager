import { CSSProperties, Component } from "react";
import translate from "#utility/translate";
import { PaletteService, PaletteData } from "#service/PaletteService";
import { ColorUtils } from "#utility/ColorUtils";

type State = {
    availablePalettes: PaletteData[],
}



export default class PaletteListCmp extends Component<any, State> {

    constructor(props) {
        super(props);
        this.state = {
            availablePalettes: []
        }
    }
    componentDidMount() {
        const _this = this;
        engine.whenReady.then(async () => {
            this.updatePalettes();
        })
    }
    private async updatePalettes() {
        const palettesSaved = await PaletteService.listLibraryPalettes();
        this.setState({
            availablePalettes: palettesSaved.sort((a, b) => a.Name.localeCompare(b.Name))
        });
    }

    render() {
        return <>
            <h1>{translate("palettesLibrary.title")}</h1>
            <h3>{translate("palettesLibrary.subtitle")}</h3>
            <section>
                {
                    this.state?.availablePalettes?.map((tt, i) =>
                        <div className="paletteViewer" key={i}>
                            <label className="w10">{tt.Name}</label>
                            <div className="colorShowcaseContainer w90">
                                <div className="colorShowcase">
                                    {
                                        tt.ColorsRGB.map((clr, j) =>
                                            <div className="lineIcon" style={{ "--lineColor": clr, "--contrastColor": ColorUtils.toRGBA(ColorUtils.getContrastColorFor(ColorUtils.toColor01(clr))) } as CSSProperties} key={j}>
                                                <div className={`routeNum chars${(j + 1)?.toString().length}`}> {j + 1}</div>
                                            </div>)
                                    }
                                </div>
                            </div>
                        </div>)
                }
            </section>
        </>;
    }
}