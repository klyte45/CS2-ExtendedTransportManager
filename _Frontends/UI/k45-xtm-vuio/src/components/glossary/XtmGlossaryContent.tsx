import translate from "#utility/translate";
import { VanillaComponentResolver } from "@klyte45/vuio-commons";
import { FocusDisabled } from "cs2/input";
import { FormattedParagraphs, MarkdownRenderer, Scrollable } from "cs2/ui";
import {
    Fragment,
    ReactNode,
    cloneElement,
    isValidElement,
    useContext,
    useEffect,
    useMemo,
    useRef,
} from "react";
import { GlossaryCategoryDef, GlossarySectionDef } from "./glossaryTypes";
import { VANILLA_SCROLLABLE_RESERVE_PROPS } from "./glossaryScrollable";

const markdownBase = new MarkdownRenderer();

function highlightNode(node: ReactNode, query: string, highlightClass: string): ReactNode {
    if (!query.trim()) return node;
    if (typeof node === "string") {
        const plain = node.replace(/\*\*(.*?)\*\*/g, "$1");
        const lower = plain.toLowerCase();
        const q = query.toLowerCase();
        if (!lower.includes(q)) return node;
        const parts: ReactNode[] = [];
        let cursor = 0;
        let hit = 0;
        let idx = lower.indexOf(q);
        while (idx !== -1) {
            if (idx > cursor) {
                parts.push(
                    <span key={`before-${hit}`} style={{ whiteSpace: "pre-wrap" }}>
                        {plain.substring(cursor, idx)}
                    </span>,
                );
            }
            parts.push(
                <span key={`highlight-${hit}`} className={highlightClass}>
                    {plain.substring(idx, idx + q.length)}
                </span>,
            );
            cursor = idx + q.length;
            hit += 1;
            idx = lower.indexOf(q, cursor);
        }
        if (cursor < plain.length) {
            parts.push(
                <span key={`after-${hit}`} style={{ whiteSpace: "pre-wrap" }}>
                    {plain.substring(cursor)}
                </span>,
            );
        }
        return <Fragment>{parts}</Fragment>;
    }
    if (isValidElement(node)) {
        const children = (node.props as any).children;
        const mapped = Array.isArray(children)
            ? children.map((child: ReactNode, i: number) => (
                <Fragment key={i}>{highlightNode(child, query, highlightClass)}</Fragment>
            ))
            : highlightNode(children, query, highlightClass);
        return cloneElement(node, {}, mapped);
    }
    if (Array.isArray(node)) {
        return node.map((child, i) => (
            <Fragment key={i}>{highlightNode(child, query, highlightClass)}</Fragment>
        ));
    }
    return node;
}

function SectionBlock({
    section,
    index,
    isSelected,
    searchQuery,
    selectionTimestamp,
}: {
    section: GlossarySectionDef;
    index: number;
    isSelected: boolean;
    searchQuery: string;
    selectionTimestamp: number;
}) {
    const { glossaryPanelTheme, ScrollableContext } = VanillaComponentResolver.instance;
    const ref = useRef<HTMLDivElement>(null);
    const scrollable = useContext(ScrollableContext);

    useEffect(() => {
        if (!isSelected) return;
        requestAnimationFrame(() => {
            if (ref.current) scrollable.scrollToTop(ref.current);
        });
    }, [isSelected, selectionTimestamp, scrollable]);

    const body = translate(section.contentKey, section.contentFallback);
    const renderer = useMemo(
        () => ({
            // Typings declare a tuple, but the runtime result is an object carrying `node`.
            render: (str: string) => {
                const result = markdownBase.render(str) as any;
                if (!searchQuery.trim()) return result;
                const rawNode = result?.node;
                const node = Array.isArray(rawNode)
                    ? rawNode.map((n: ReactNode, i: number) => (
                        <Fragment key={i}>{highlightNode(n, searchQuery, glossaryPanelTheme.textHighlight)}</Fragment>
                    ))
                    : highlightNode(rawNode, searchQuery, glossaryPanelTheme.textHighlight);
                return { ...result, node };
            },
        }),
        [searchQuery, glossaryPanelTheme.textHighlight],
    );

    return (
        <div ref={ref} data-section-id={section.id}>
            <div className={glossaryPanelTheme.sectionTitle}>
                <span>
                    {`${index + 1}. `}
                    {translate(section.titleKey, section.titleFallback)}
                </span>
            </div>
            <FormattedParagraphs
                className={glossaryPanelTheme.sectionParagraph}
                renderer={renderer}
                text={body}
            />
        </div>
    );
}

export function XtmGlossaryContent({
    category,
    selectedSection,
    searchQuery,
    selectionTimestamp,
    onSectionSelected,
}: {
    category: GlossaryCategoryDef;
    selectedSection: GlossarySectionDef | null;
    searchQuery: string;
    selectionTimestamp: number;
    onSectionSelected: (section: GlossarySectionDef) => void;
}) {
    const { glossaryPanelTheme } = VanillaComponentResolver.instance;

    return (
        <div className={glossaryPanelTheme.content}>
            <FocusDisabled>
                <Scrollable
                    key={`content-${category.id}`}
                    className={glossaryPanelTheme.scrollable}
                    {...VANILLA_SCROLLABLE_RESERVE_PROPS}
                >
                    <div className={glossaryPanelTheme.sectionHeader}>
                        {category.icon && (
                            <img src={category.icon} className={glossaryPanelTheme.categoryIcon} />
                        )}
                        {translate(category.titleKey, category.titleFallback)}
                    </div>
                    <div className={glossaryPanelTheme.sectionTitle}>
                        {translate("glossary.tableOfContents", "Table of contents")}
                    </div>
                    {category.sections.map((sec, index) => (
                        <div
                            key={`toc-${sec.id}`}
                            className={glossaryPanelTheme.sectionLink}
                            onClick={() => onSectionSelected(sec)}
                        >
                            {`${index + 1}. `}
                            {translate(sec.titleKey, sec.titleFallback)}
                        </div>
                    ))}
                    {category.sections.map((sec, index) => (
                        <SectionBlock
                            key={sec.id}
                            section={sec}
                            index={index}
                            isSelected={selectedSection?.id === sec.id}
                            searchQuery={searchQuery}
                            selectionTimestamp={selectionTimestamp}
                        />
                    ))}
                </Scrollable>
            </FocusDisabled>
        </div>
    );
}
