import iconWhite from "#images/iconWhite.svg";
import translate from "#utility/translate";
import { VanillaComponentResolver } from "@klyte45/vuio-commons";
import { FocusDisabled } from "cs2/input";
import {
    Children,
    cloneElement,
    isValidElement,
    ReactElement,
    ReactNode,
    useState,
} from "react";
import { XtmGlossaryIndexPage } from "./XtmGlossaryIndexPage";
import "#styles/glossary.scss";

type GlossaryProps = {
    selectedTab?: number;
    onSelectTab?: (tab: number) => void;
    selectedCategory?: number;
    onSelectCategory?: (category: number) => void;
    onClose?: () => void;
};

/**
 * Preserve a solitary child element. Children.map wraps one child in an array and can
 * break Children.only / focus ownership around the panel shell.
 */
function mapChildrenPreserveShape(children: ReactNode, mapFn: (child: ReactNode) => ReactNode): ReactNode {
    const arr = Children.toArray(children);
    if (arr.length === 0) return children;
    if (arr.length === 1) return mapFn(arr[0]);
    return arr.map(mapFn);
}

function mapTree(node: ReactNode, mapper: (el: ReactElement<any>) => ReactElement<any> | null): ReactNode {
    if (!isValidElement(node)) return node;
    const el = node as ReactElement<any>;
    const mapped = mapper(el);
    if (mapped) return mapped;
    if (el.props?.children == null) return el;
    return cloneElement(el, {
        ...el.props,
        children: mapChildrenPreserveShape(el.props.children, (child) => mapTree(child, mapper)),
    });
}

/** Find the vanilla Panel (has header + children) and rewrite it in place. */
function rewriteGlossaryPanel(
    node: ReactNode,
    rewrite: (panel: ReactElement<any>) => ReactElement<any>,
): ReactNode {
    return mapTree(node, (el) => {
        if (el.props?.header == null || el.props?.children == null) return null;
        return rewrite(el);
    });
}

function XtmGlossaryToggleButton({
    selected,
    onToggle,
}: {
    selected: boolean;
    onToggle: () => void;
}) {
    const ToolButton = VanillaComponentResolver.instance.ToolButton;
    return (
        <FocusDisabled>
            <ToolButton
                src={iconWhite}
                selected={selected}
                tooltip={translate("glossary.toggleXtm", "XTM glossary")}
                onSelect={onToggle}
            />
        </FocusDisabled>
    );
}

const XTM_TAB_ID = "xtm-overview";
// UISound is types-only at runtime, so use the raw value vanilla glossary tabs pass (UISound.economy).
const TAB_SELECT_SOUND = "economy";

/** XTM-owned header: mod title plus a tab bar holding the single mod-logo tab. */
function XtmGlossaryHeader({ onClose }: { onClose?: () => void }) {
    const { PanelTitleBar, TabBar, Tab, Tooltip, glossaryPanelTheme } = VanillaComponentResolver.instance;
    // Vanilla glossary module classes keep the tab strip pixel-identical to the original panel.
    return (
        <>
            <PanelTitleBar onCloseOverride={onClose}>
                {translate("glossary.title", "XTM Encyclopedia")}
            </PanelTitleBar>
            <TabBar className={glossaryPanelTheme.glossaryPanelTabBar}>
                <Tooltip tooltip={translate("glossary.tab.overview", "XTM overview")}>
                    <Tab
                        id={XTM_TAB_ID}
                        selectedId={XTM_TAB_ID}
                        className={glossaryPanelTheme.glossaryPanelTab}
                        selectSound={TAB_SELECT_SOUND}
                        onSelect={() => { }}
                    >
                        <img src={iconWhite} className={glossaryPanelTheme.tabIcon} />
                    </Tab>
                </Tooltip>
            </TabBar>
        </>
    );
}

const stripThemeCache = new WeakMap<object, any>();

/**
 * Tag the panel's header slot so the side strip can anchor to the window box
 * instead of the content box. Cached per source theme to keep Panel memos stable.
 */
function withStripHeader(theme: any) {
    const source = theme ?? VanillaComponentResolver.instance.panelTheme;
    const cached = stripThemeCache.get(source);
    if (cached) return cached;
    const patched = {
        ...source,
        header: [source?.header, "xtm-glossary-header"].filter(Boolean).join(" "),
    };
    stripThemeCache.set(source, patched);
    return patched;
}

/**
 * Always invoke the vanilla GlossaryPanel so its Panel shell stays mounted
 * (close / focus / transitions). Swap only children in XTM mode; keep a
 * forward-compatible side strip outside the right edge for the mode toggle.
 */
export const XtmGlossaryPanelRegister = (Component: any): any => {
    return (props: GlossaryProps) => {
        // Default vanilla each open — no persistence in this slice.
        const [useXtmGlossary, setUseXtmGlossary] = useState(false);

        const onToggle = () => setUseXtmGlossary((x) => !x);

        const sideStrip = (
            <div className="xtm-glossary-side-strip" data-xtm-glossary-strip="">
                <XtmGlossaryToggleButton selected={useXtmGlossary} onToggle={onToggle} />
            </div>
        );

        // CRITICAL: call every render — do not conditionally skip (hooks + panel shell lifetime).
        const tree = Component(props);

        return rewriteGlossaryPanel(tree, (panel) => {
            const shellClass = [panel.props.className, "xtm-glossary-shell"].filter(Boolean).join(" ");
            const theme = withStripHeader(panel.props.theme);

            if (useXtmGlossary) {
                return cloneElement(panel, {
                    ...panel.props,
                    className: shellClass,
                    theme,
                    contentClassName: [
                        panel.props.contentClassName,
                        "xtm-glossary-content",
                    ]
                        .filter(Boolean)
                        .join(" "),
                    header: (
                        <>
                            <XtmGlossaryHeader onClose={panel.props.onClose ?? props.onClose} />
                            {sideStrip}
                        </>
                    ),
                    children: <XtmGlossaryIndexPage />,
                });
            }

            return cloneElement(panel, {
                ...panel.props,
                className: shellClass,
                theme,
                header: (
                    <>
                        {panel.props.header}
                        {sideStrip}
                    </>
                ),
            });
        });
    };
};
