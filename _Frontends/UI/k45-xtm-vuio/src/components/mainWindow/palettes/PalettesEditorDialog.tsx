import translate from "#utility/translate";
import { VanillaComponentResolver } from "@klyte45/vuio-commons";
import { Panel } from "cs2/ui";
import { XtmPalettesPage } from "./XtmPalettesPage";

type DialogProps = {
    onClose?: () => void;
};

/**
 * Light FE-only draggable dialog hosting the shared palettes screen (editor mode).
 * Layout is self-contained: the vanilla game main screen module isn't available in the editor.
 */
export function PalettesEditorDialog({ onClose }: DialogProps) {
    const PanelTitleBar = VanillaComponentResolver.instance.PanelTitleBar;
    return (
        <div className="xtm-palettesEditorDialog">
            <Panel
                header={
                    <PanelTitleBar onCloseOverride={onClose}>
                        {translate("cityPalettesLibrary.title", "Available palettes")}
                    </PanelTitleBar>
                }
                draggable
            >
                <div className="xtm-palettesEditorDialog_body">
                    <XtmPalettesPage />
                </div>
            </Panel>
        </div>
    );
}
