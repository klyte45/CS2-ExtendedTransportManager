import translate from "#utility/translate";
import { Scrollable } from "cs2/ui";

const FUTURE_SECTION_KEYS: Array<{ key: string; fallback: string }> = [
    { key: "glossary.index.placeholder.overview", fallback: "Mod overview" },
    { key: "glossary.index.placeholder.lines", fallback: "Lines & overview listing" },
    { key: "glossary.index.placeholder.fares", fallback: "Fares & ticket prices" },
    { key: "glossary.index.placeholder.vehicles", fallback: "Vehicle model groups" },
    { key: "glossary.index.placeholder.palettes", fallback: "Line color palettes" },
];

/**
 * Static XTM glossary overview / index. Establishes layout and locale keys before
 * binder-driven Tab → Category → Section content arrives.
 */
export function XtmGlossaryIndexPage() {
    return (
        <div className="xtm-glossary-index">
            <div className="xtm-glossary-index-top">
                <h2 className="xtm-glossary-index-title">
                    {translate("glossary.index.title", "Extended Transport Manager")}
                </h2>
                <p className="xtm-glossary-index-intro">
                    {translate(
                        "glossary.index.intro",
                        "XTM extends Cities: Skylines II public transport with richer line management, occupancy insights, fare groups, vehicle model groups, and palettes. This glossary will document those tools — start here for an overview of what the mod adds.",
                    )}
                </p>
            </div>
            <div className="xtm-glossary-index-bottom">
                <div className="xtm-glossary-index-nav">
                    <div className="xtm-glossary-index-nav-heading">
                        {translate("glossary.index.sectionsHeading", "Coming documentation")}
                    </div>
                    <Scrollable className="xtm-glossary-index-nav-scroll" trackVisibility="scrollable">
                        {FUTURE_SECTION_KEYS.map((item, index) => (
                            <div key={item.key} className="xtm-glossary-index-nav-item" data-disabled="">
                                <span className="xtm-glossary-index-nav-num">{index + 1}.</span>
                                <span>{translate(item.key, item.fallback)}</span>
                            </div>
                        ))}
                    </Scrollable>
                </div>
                <div className="xtm-glossary-index-body">
                    <Scrollable className="xtm-glossary-index-body-scroll" trackVisibility="scrollable">
                        <div className="xtm-glossary-index-body-heading">
                            {translate("glossary.index.bodyHeading", "Welcome")}
                        </div>
                        <p className="xtm-glossary-index-body-text">
                            {translate(
                                "glossary.index.body",
                                "Use the XTM button on the right of this panel to switch between the game Encyclopedia and XTM’s own help. Detailed sections will appear in the list on the left as they are written.",
                            )}
                        </p>
                        <div className="xtm-glossary-index-placeholder-note">
                            {translate(
                                "glossary.index.placeholderNote",
                                "Section entries are placeholders for now — content will follow in a later update.",
                            )}
                        </div>
                    </Scrollable>
                </div>
            </div>
        </div>
    );
}
