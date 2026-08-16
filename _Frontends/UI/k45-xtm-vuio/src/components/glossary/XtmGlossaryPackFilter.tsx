import translate from "#utility/translate";
import { VanillaComponentResolver } from "@klyte45/vuio-commons";
import { FocusDisabled } from "cs2/input";

/**
 * Vanilla-shaped pack filter bar. Packs are XTM release-version tags (not DLC).
 * Renders nothing when the current tab has no pack tags — ready for future releases.
 */
export function XtmGlossaryPackFilter({
    packs,
    selectedPacks,
    onChange,
}: {
    packs: string[];
    selectedPacks: string[];
    onChange: (next: string[]) => void;
}) {
    const { ToolButton, glossaryPanelTheme } = VanillaComponentResolver.instance;
    if (!packs.length) return null;

    const toggle = (pack: string | null) => {
        if (pack === null) {
            if (selectedPacks.length > 0) onChange([]);
            return;
        }
        if (selectedPacks.includes(pack)) {
            onChange(selectedPacks.filter((p) => p !== pack));
        } else {
            onChange([...selectedPacks, pack]);
        }
    };

    return (
        <div className={glossaryPanelTheme.filterBar}>
            <span>{translate("glossary.packFilter", "Packs")}</span>
            <FocusDisabled>
                <ToolButton
                    className={glossaryPanelTheme.contentFilterButton}
                    multiSelect
                    focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                    src="Media/Tools/Snap Options/All.svg"
                    selected={selectedPacks.length === 0}
                    onSelect={() => toggle(null)}
                    tooltip={translate("glossary.packFilter.all", "All packs")}
                />
                {packs.map((pack) => (
                    <ToolButton
                        key={pack}
                        className={glossaryPanelTheme.contentFilterButton}
                        multiSelect
                        focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                        src={iconForPack(pack)}
                        selected={selectedPacks.includes(pack)}
                        onSelect={() => toggle(pack)}
                        tooltip={pack}
                    />
                ))}
            </FocusDisabled>
        </div>
    );
}

function iconForPack(pack: string): string {
    // Release tags have no DLC art; use the XTM brand until pack-specific icons exist.
    return pack ? "coui://uil/Colored/StarFilled.svg" : "Media/Tools/Snap Options/All.svg";
}
