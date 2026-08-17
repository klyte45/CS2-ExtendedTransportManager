import translate from "#utility/translate";
import { VanillaComponentResolver } from "@klyte45/vuio-commons";
import { trigger } from "cs2/api";
import { FocusDisabled } from "cs2/input";
import { FormattedParagraphs, MarkdownRenderer, Panel, Portal, Scrollable, Tooltip } from "cs2/ui";
import {
    Fragment,
    ReactNode,
    cloneElement,
    isValidElement,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { GlossaryCategoryDef, GlossarySectionDef } from "./glossaryTypes";
import { VANILLA_SCROLLABLE_RESERVE_PROPS } from "./glossaryScrollable";

const markdownBase = new MarkdownRenderer();

const EXTERNAL_LINK_PATTERN = /^https?:\/\//i;

// Match vanilla tutorial/glossary image sizing (tutorial-input-hint.tsx).
const IMAGE_MAX_WIDTH_REM = 850;
const IMAGE_DEFAULT_HEIGHT_REM = 300;
const IMAGE_HEIGHT_SUFFIX = /\s+height\s*:\s*(\d+)\s*$/i;

// Lightbox: show near-native size, clamped to the 1920x1080rem reference screen
// (minus the panel title bar and padding) so the panel never overflows.
const PREVIEW_MAX_WIDTH_REM = 1800;
const PREVIEW_MAX_HEIGHT_REM = 940;

// Vanilla trigger used by the Paradox panel; hands the URL to Application.OpenURL.
function openGlossaryLink(data: string) {
    if (EXTERNAL_LINK_PATTERN.test(data)) trigger("paradox", "showLink", data);
}

function parseImageSrc(src: string | undefined): { path: string; height: number } {
    const raw = (src ?? "").trim();
    const match = raw.match(IMAGE_HEIGHT_SUFFIX);
    if (match) {
        const height = parseInt(match[1], 10);
        return {
            path: raw.replace(IMAGE_HEIGHT_SUFFIX, "").trim(),
            height: Number.isNaN(height) ? IMAGE_DEFAULT_HEIGHT_REM : height,
        };
    }
    return { path: raw, height: IMAGE_DEFAULT_HEIGHT_REM };
}

function applyVanillaImageSize(img: HTMLImageElement, targetHeightRem: number) {
    const ratio = img.width / img.height;
    if (!Number.isFinite(ratio) || ratio <= 0) return;

    const maxWidth = IMAGE_MAX_WIDTH_REM;
    const widthAtHeight = targetHeightRem * ratio;
    if (widthAtHeight > maxWidth) {
        img.style.width = `${maxWidth}rem`;
        img.style.height = `${maxWidth / ratio}rem`;
    } else {
        img.style.width = `${widthAtHeight}rem`;
        img.style.height = `${targetHeightRem}rem`;
    }
    const marginLeft = Math.max(0, (maxWidth - parseFloat(img.style.width)) / 2);
    img.style.marginLeft = `${marginLeft}rem`;
}

/** Size to natural pixel dimensions (1px ≈ 1rem), then clamp to the preview dialog. */
function applyPreviewImageSize(img: HTMLImageElement) {
    const nw = img.naturalWidth || img.width;
    const nh = img.naturalHeight || img.height;
    if (!nw || !nh) return;
    const ratio = nw / nh;
    if (!Number.isFinite(ratio) || ratio <= 0) return;

    let width = nw;
    let height = nh;
    if (width > PREVIEW_MAX_WIDTH_REM) {
        width = PREVIEW_MAX_WIDTH_REM;
        height = width / ratio;
    }
    if (height > PREVIEW_MAX_HEIGHT_REM) {
        height = PREVIEW_MAX_HEIGHT_REM;
        width = height * ratio;
    }
    img.style.width = `${width}rem`;
    img.style.height = `${height}rem`;
}

function styleImages(node: ReactNode, onImageOpen: (src: string, alt: string) => void): ReactNode {
    if (Array.isArray(node)) return node.map((child) => styleImages(child, onImageOpen));
    if (isValidElement(node) && node.type === "img") {
        const props = node.props as { src?: string; alt?: string };
        const { path, height } = parseImageSrc(props.src);
        const alt = props.alt ?? "";
        const img = cloneElement(node as any, {
            className: "xtm-glossary-image",
            src: path,
            onLoad: (e: { target: HTMLImageElement }) => applyVanillaImageSize(e.target, height),
            onClick: () => onImageOpen(path, alt),
        });
        return (
            <Tooltip key={node.key ?? undefined} tooltip={translate("glossary.imagePreview.tooltip")}>
                {img}
            </Tooltip>
        );
    }
    return node;
}

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
    onImageOpen,
}: {
    section: GlossarySectionDef;
    index: number;
    isSelected: boolean;
    searchQuery: string;
    selectionTimestamp: number;
    onImageOpen: (src: string, alt: string) => void;
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

    const body = translate(section.contentKey);
    const renderer = useMemo(
        () => ({
            // Typings declare a tuple, but the runtime result is an object carrying `node`.
            render: (str: string) => {
                const result = markdownBase.render(str) as any;
                const rawNode = styleImages(result?.node, onImageOpen);
                if (!searchQuery.trim()) return { ...result, node: rawNode };
                const node = Array.isArray(rawNode)
                    ? rawNode.map((n: ReactNode, i: number) => (
                        <Fragment key={i}>{highlightNode(n, searchQuery, glossaryPanelTheme.textHighlight)}</Fragment>
                    ))
                    : highlightNode(rawNode, searchQuery, glossaryPanelTheme.textHighlight);
                return { ...result, node };
            },
        }),
        [searchQuery, glossaryPanelTheme.textHighlight, onImageOpen],
    );

    return (
        <div ref={ref} data-section-id={section.id}>
            <div className={glossaryPanelTheme.sectionTitle}>
                <span>
                    {`${index + 1}. `}
                    {translate(section.titleKey)}
                </span>
            </div>
            <FormattedParagraphs
                className={glossaryPanelTheme.sectionParagraph}
                renderer={renderer}
                text={body}
                onLinkSelect={openGlossaryLink}
            />
        </div>
    );
}

function GlossaryImagePreviewDialog({
    src,
    alt,
    onClose,
}: {
    src: string;
    alt: string;
    onClose: () => void;
}) {
    const PanelTitleBar = VanillaComponentResolver.instance.PanelTitleBar;
    return (
        <Portal>
            <div className="xtm-glossary-imagePreview">
                <div className="xtm-glossary-imagePreview_backdrop" onClick={onClose} />
                <Panel
                    className="xtm-glossary-imagePreview_panel"
                    contentClassName="xtm-glossary-imagePreview_body"
                    header={
                        <PanelTitleBar onCloseOverride={onClose}>
                            {alt || translate("glossary.imagePreview.title")}
                        </PanelTitleBar>
                    }
                >
                    <img
                        src={src}
                        alt={alt}
                        className="xtm-glossary-imagePreview_img"
                        onLoad={(e) => applyPreviewImageSize(e.target as HTMLImageElement)}
                    />
                </Panel>
            </div>
        </Portal>
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
    const [preview, setPreview] = useState<{ src: string; alt: string } | null>(null);
    const onImageOpen = useCallback((src: string, alt: string) => setPreview({ src, alt }), []);

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
                        {translate(category.titleKey)}
                    </div>
                    <div className={glossaryPanelTheme.sectionTitle}>
                        {translate("glossary.tableOfContents")}
                    </div>
                    {category.sections.map((sec, index) => (
                        <div
                            key={`toc-${sec.id}`}
                            className={glossaryPanelTheme.sectionLink}
                            onClick={() => onSectionSelected(sec)}
                        >
                            {`${index + 1}. `}
                            {translate(sec.titleKey)}
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
                            onImageOpen={onImageOpen}
                        />
                    ))}
                </Scrollable>
            </FocusDisabled>
            {preview && (
                <GlossaryImagePreviewDialog
                    src={preview.src}
                    alt={preview.alt}
                    onClose={() => setPreview(null)}
                />
            )}
        </div>
    );
}
