import iconWhite from "#images/iconWhite.svg";
import { LineManagementService } from "#service/LineManagementService";
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
    useRef,
    useState,
} from "react";
import { XtmLineListingPage } from "./XtmLineListingPage";
import "#styles/lineListing.scss";

type OverviewProps = {
    selectedTab?: number;
    onSelectTab?: (tab: number) => void;
    onClose?: () => void;
};

/**
 * Preserve a solitary child element. Children.map wraps one child in an array and breaks
 * TutorialGuideTarget (Children.only) around TransportationOverviewPanel.
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
function rewriteOverviewPanel(
    node: ReactNode,
    rewrite: (panel: ReactElement<any>) => ReactElement<any>,
): ReactNode {
    return mapTree(node, (el) => {
        if (el.props?.header == null || el.props?.children == null) return null;
        return rewrite(el);
    });
}

function XtmToggleButton({
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
                tooltip={translate("lineList.toggleXtmListing", "XTM line listing")}
                onSelect={onToggle}
            />
        </FocusDisabled>
    );
}

/**
 * Always invoke the vanilla TransportationOverviewPanel so its Panel shell stays mounted:
 * CloseConsumer(onClose → game.closePanel), FocusRoot, transitionSounds, TutorialGuideTarget.
 * Swapping that shell for a custom Panel unmounts Close/focus ownership and the game clears
 * activeGamePanel — the whole overview (including wrapper divs) disappears.
 */
export const XtmTransportationOverviewRegister = (Component: any): any => {
    return (props: OverviewProps) => {
        const [useXtmListing, setUseXtmListing] = useState(true);
        const userTouchedRef = useRef(false);
        const PanelTitleBar = VanillaComponentResolver.instance.PanelTitleBar;

        useEffect(() => {
            let cancelled = false;
            LineManagementService.getUseXtmLineListingDefault().then((value) => {
                if (!cancelled && !userTouchedRef.current) setUseXtmListing(value);
            });
            return () => {
                cancelled = true;
            };
        }, []);

        const onToggle = () => {
            userTouchedRef.current = true;
            setUseXtmListing((x) => !x);
        };

        const toggle = <XtmToggleButton selected={useXtmListing} onToggle={onToggle} />;

        // CRITICAL: call every render — do not conditionally skip (hooks + panel shell lifetime).
        const tree = Component(props);

        return rewriteOverviewPanel(tree, (panel) => {
            if (useXtmListing) {
                return cloneElement(panel, {
                    ...panel.props,
                    // Keep panel.onClose / theme / transitionSounds from vanilla.
                    className: [panel.props.className, "xtm-transport-overview-shell"].filter(Boolean).join(" "),
                    // Dedicated class — do not style all content_* (Scrollable uses content_gqa).
                    contentClassName: [
                        panel.props.contentClassName,
                        "xtm-transport-overview-content",
                    ]
                        .filter(Boolean)
                        .join(" "),
                    header: (
                        <>
                            <PanelTitleBar onCloseOverride={props.onClose}>
                                {translate("lineList.title", "Lines")}
                            </PanelTitleBar>
                            <div className="xtm-transport-overview-header-tools xtm-transport-overview-header-xtm">{toggle}</div>
                        </>
                    ),
                    children: <XtmLineListingPage />,
                });
            }

            return cloneElement(panel, {
                ...panel.props,
                header: (
                    <>
                        <div className="xtm-transport-overview-header-tools">{toggle}</div>
                        {panel.props.header}
                    </>
                ),
            });
        });
    };
};
