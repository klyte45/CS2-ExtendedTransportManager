import translate from "#utility/translate";
import { VanillaComponentResolver } from "@klyte45/vuio-commons";
import { Scrollable } from "cs2/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GlossaryCategoryDef, GlossarySectionDef } from "./glossaryTypes";
import { VANILLA_SCROLLABLE_PROPS } from "./glossaryScrollable";

export function XtmGlossaryCategoryBrowser({
    categories,
    selectedCategory,
    selectedCategoryIndex,
    searchQuery,
    onCategorySelected,
    onSectionSelected,
}: {
    categories: GlossaryCategoryDef[];
    selectedCategory: GlossaryCategoryDef | null;
    selectedCategoryIndex: number;
    searchQuery: string;
    onCategorySelected: (category: GlossaryCategoryDef) => void;
    onSectionSelected: (section: GlossarySectionDef) => void;
}) {
    const {
        FoldoutItem,
        FoldoutItemHeader,
        glossaryFoldoutTheme,
        glossarySubFoldoutTheme,
        glossaryPanelTheme,
    } = VanillaComponentResolver.instance;

    const [expanded, setExpanded] = useState<number[]>([selectedCategoryIndex]);

    useEffect(() => {
        setExpanded([selectedCategoryIndex]);
    }, [selectedCategoryIndex, categories]);

    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return null;
        return categories
            .map((cat) => {
                const catTitle = translate(cat.titleKey, cat.titleFallback).toLowerCase();
                const catHit = catTitle.includes(q);
                const matchingSections = cat.sections.filter((sec) => {
                    const title = translate(sec.titleKey, sec.titleFallback).toLowerCase();
                    const body = translate(sec.contentKey, sec.contentFallback).toLowerCase();
                    return title.includes(q) || body.includes(q);
                });
                if (!catHit && matchingSections.length === 0) return null;
                return {
                    ...cat,
                    sections: catHit ? cat.sections : matchingSections,
                };
            })
            .filter((c): c is GlossaryCategoryDef => c != null);
    }, [categories, searchQuery]);

    const visible = filtered ?? categories;

    const onToggleExpanded = useCallback((index: number, next: boolean) => {
        setExpanded((prev) => (next ? (prev.includes(index) ? prev : [...prev, index]) : prev.filter((i) => i !== index)));
    }, []);

    return (
        <div className={glossaryPanelTheme.categoryBrowser}>
            <Scrollable className={glossaryPanelTheme.scrollable} {...VANILLA_SCROLLABLE_PROPS}>
                {visible.map((cat, index) => {
                    const selected = selectedCategory?.id === cat.id;
                    return (
                        <FoldoutItem
                            key={cat.id}
                            expanded={expanded.includes(index)}
                            theme={glossaryFoldoutTheme}
                            type="Category"
                            className={selected ? "selected" : undefined}
                            onSelect={() => {
                                onCategorySelected(cat);
                                const idx = categories.findIndex((c) => c.id === cat.id);
                                setExpanded([idx >= 0 ? idx : index]);
                            }}
                            onToggleExpanded={(next) => onToggleExpanded(index, next)}
                            header={
                                <FoldoutItemHeader>
                                    {translate(cat.titleKey, cat.titleFallback)}
                                </FoldoutItemHeader>
                            }
                        >
                            {cat.sections.map((sec, secIndex) => (
                                <FoldoutItem
                                    key={sec.id}
                                    theme={glossarySubFoldoutTheme}
                                    type="Item"
                                    onSelect={() => {
                                        onCategorySelected(cat);
                                        onSectionSelected(sec);
                                    }}
                                    header={
                                        <FoldoutItemHeader>
                                            <span>
                                                {`${secIndex + 1}. `}
                                                {translate(sec.titleKey, sec.titleFallback)}
                                            </span>
                                        </FoldoutItemHeader>
                                    }
                                />
                            ))}
                        </FoldoutItem>
                    );
                })}
            </Scrollable>
        </div>
    );
}
