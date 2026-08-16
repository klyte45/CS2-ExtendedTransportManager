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
    useEffect,
    useMemo,
    useState,
} from "react";
import { ALL_TAB_ID, getGlossaryTabs } from "./glossaryContent";
import {
    consumeForceXtmGlossary,
    subscribeForceXtmGlossary,
} from "./glossaryNavigation";
import { XtmGlossaryPage } from "./XtmGlossaryPage";
import { WEIntegrationService } from "#service/WEIntegrationService";
import "#styles/glossary.scss";

type GlossaryProps = {
    selectedTab?: number;
    onSelectTab?: (tab: number) => void;
    selectedCategory?: number;
    onSelectCategory?: (category: number) => void;
    onClose?: () => void;
};

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

const TAB_SELECT_SOUND = "economy";

function XtmGlossaryHeader({
    onClose,
    selectedTabId,
    onSelectTabId,
    weAvailable,
}: {
    onClose?: () => void;
    selectedTabId: string;
    onSelectTabId: (tabId: string) => void;
    weAvailable: boolean;
}) {
    const { PanelTitleBar, TabBar, Tab, Tooltip, glossaryPanelTheme } = VanillaComponentResolver.instance;
    const tabs = useMemo(() => getGlossaryTabs({ weAvailable }), [weAvailable]);

    return (
        <>
            <PanelTitleBar onCloseOverride={onClose}>
                {translate("glossary.title", "XTM Encyclopedia")}
            </PanelTitleBar>
            <TabBar className={glossaryPanelTheme.glossaryPanelTabBar}>
                {tabs.map((tab) => (
                    <Tooltip
                        key={tab.id}
                        tooltip={translate(tab.titleKey, tab.titleFallback)}
                    >
                        <Tab
                            id={tab.id}
                            selectedId={selectedTabId}
                            className={glossaryPanelTheme.glossaryPanelTab}
                            selectSound={TAB_SELECT_SOUND}
                            onSelect={(id: string) => onSelectTabId(id)}
                        >
                            <img src={tab.icon} className={glossaryPanelTheme.tabIcon} />
                        </Tab>
                    </Tooltip>
                ))}
            </TabBar>
        </>
    );
}

const stripThemeCache = new WeakMap<object, any>();

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
 * (close / focus / transitions). Swap header + children in XTM mode; keep a
 * forward-compatible side strip outside the right edge for the mode toggle.
 */
export const XtmGlossaryPanelRegister = (Component: any): any => {
    return (props: GlossaryProps) => {
        const [useXtmGlossary, setUseXtmGlossary] = useState(false);
        const [selectedTabId, setSelectedTabId] = useState(ALL_TAB_ID);
        const [manualTabToken, setManualTabToken] = useState(0);
        const [weAvailable, setWeAvailable] = useState(true);

        useEffect(() => {
            let cancelled = false;
            void WEIntegrationService.isAvailable()
                .then((v) => { if (!cancelled) setWeAvailable(!!v); })
                .catch(() => { if (!cancelled) setWeAvailable(false); });
            return () => { cancelled = true; };
        }, []);

        useEffect(() => {
            const applyForce = () => {
                if (consumeForceXtmGlossary()) setUseXtmGlossary(true);
            };
            applyForce();
            return subscribeForceXtmGlossary(applyForce);
        }, []);

        const onToggle = () => setUseXtmGlossary((x) => !x);

        const onManualSelectTab = (tabId: string) => {
            setSelectedTabId(tabId);
            setManualTabToken((t) => t + 1);
        };

        const sideStrip = (
            <div className="xtm-glossary-side-strip" data-xtm-glossary-strip="">
                <XtmGlossaryToggleButton selected={useXtmGlossary} onToggle={onToggle} />
            </div>
        );

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
                            <XtmGlossaryHeader
                                onClose={panel.props.onClose ?? props.onClose}
                                selectedTabId={selectedTabId}
                                onSelectTabId={onManualSelectTab}
                                weAvailable={weAvailable}
                            />
                            {sideStrip}
                        </>
                    ),
                    children: (
                        <XtmGlossaryPage
                            selectedTabId={selectedTabId}
                            onSelectTabId={setSelectedTabId}
                            clearSearchToken={manualTabToken}
                        />
                    ),
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
