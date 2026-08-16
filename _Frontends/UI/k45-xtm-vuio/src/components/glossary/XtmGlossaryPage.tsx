import translate from "#utility/translate";
import { VanillaComponentResolver } from "@klyte45/vuio-commons";
import { FocusDisabled } from "cs2/input";
import { useCallback, useEffect, useMemo, useState } from "react";
import { WEIntegrationService } from "#service/WEIntegrationService";
import { ALL_TAB_ID, getGlossaryTabs } from "./glossaryContent";
import {
    consumePendingGlossaryFocus,
    getGlossaryFocusToken,
    subscribeGlossaryFocus,
} from "./glossaryNavigation";
import { GlossaryCategoryDef, GlossarySectionDef, GlossaryTabDef } from "./glossaryTypes";
import { XtmGlossaryCategoryBrowser } from "./XtmGlossaryCategoryBrowser";
import { XtmGlossaryContent } from "./XtmGlossaryContent";
import { XtmGlossaryPackFilter } from "./XtmGlossaryPackFilter";
import { XtmGlossarySearch } from "./XtmGlossarySearch";

export function XtmGlossaryPage({
    selectedTabId,
    onSelectTabId,
    clearSearchToken,
}: {
    selectedTabId: string;
    onSelectTabId: (tabId: string) => void;
    /** Incremented on manual header tab clicks — clears search (vanilla parity). */
    clearSearchToken?: number;
}) {
    const { glossaryPanelTheme } = VanillaComponentResolver.instance;
    const [weAvailable, setWeAvailable] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<GlossaryCategoryDef | null>(null);
    const [selectedSection, setSelectedSection] = useState<GlossarySectionDef | null>(null);
    const [selectionTimestamp, setSelectionTimestamp] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPacks, setSelectedPacks] = useState<string[]>([]);
    const [focusToken, setFocusToken] = useState(getGlossaryFocusToken);

    useEffect(() => {
        let cancelled = false;
        void WEIntegrationService.isAvailable().then((available) => {
            if (!cancelled) setWeAvailable(!!available);
        }).catch(() => {
            if (!cancelled) setWeAvailable(false);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => subscribeGlossaryFocus(() => setFocusToken(getGlossaryFocusToken())), []);

    useEffect(() => {
        if (clearSearchToken == null || clearSearchToken === 0) return;
        setSearchQuery("");
    }, [clearSearchToken]);

    const tabs = useMemo(() => getGlossaryTabs({ weAvailable }), [weAvailable]);
    const activeTab: GlossaryTabDef = tabs.find((t) => t.id === selectedTabId) ?? tabs[0];

    const tabPacks = useMemo(() => {
        const set = new Set<string>();
        for (const cat of activeTab?.categories ?? []) {
            for (const pack of cat.packs) {
                if (pack && pack.trim()) set.add(pack);
            }
        }
        return Array.from(set);
    }, [activeTab]);

    useEffect(() => {
        if (tabPacks.length === 0) setSelectedPacks([]);
    }, [tabPacks]);

    const packFilteredCategories = useMemo(() => {
        const cats = activeTab?.categories ?? [];
        if (selectedPacks.length === 0) return cats;
        return cats.filter((c) => c.packs.some((p) => selectedPacks.includes(p)));
    }, [activeTab, selectedPacks]);

    // Keep category selection valid when tab/packs/WE filter change.
    useEffect(() => {
        if (!packFilteredCategories.length) {
            setSelectedCategory(null);
            setSelectedSection(null);
            return;
        }
        setSelectedCategory((prev) => {
            if (prev && packFilteredCategories.some((c) => c.id === prev.id)) {
                return packFilteredCategories.find((c) => c.id === prev.id) ?? packFilteredCategories[0];
            }
            return packFilteredCategories[0];
        });
        setSelectedSection(null);
    }, [packFilteredCategories]);

    const selectedCategoryIndex = useMemo(() => {
        if (!selectedCategory) return 0;
        const idx = packFilteredCategories.findIndex((c) => c.id === selectedCategory.id);
        return idx >= 0 ? idx : 0;
    }, [packFilteredCategories, selectedCategory]);

    const onCategorySelected = useCallback((category: GlossaryCategoryDef) => {
        setSelectedCategory(category);
        setSelectedSection(null);
    }, []);

    const onSectionSelected = useCallback((section: GlossarySectionDef) => {
        setSelectedSection(section);
        setSelectionTimestamp(Date.now());
    }, []);

    const onSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
        if (value && selectedTabId !== ALL_TAB_ID) {
            onSelectTabId(ALL_TAB_ID);
        }
    }, [onSelectTabId, selectedTabId]);

    // Search autofocus: first matching category/section under current (pack-filtered) list.
    useEffect(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return;
        for (const cat of packFilteredCategories) {
            const catTitle = translate(cat.titleKey, cat.titleFallback).toLowerCase();
            const catHit = catTitle.includes(q);
            const matchingSections = cat.sections.filter((sec) => {
                const title = translate(sec.titleKey, sec.titleFallback).toLowerCase();
                const body = translate(sec.contentKey, sec.contentFallback).toLowerCase();
                return title.includes(q) || body.includes(q);
            });
            if (catHit || matchingSections.length > 0) {
                setSelectedCategory(cat);
                const sections = catHit ? cat.sections : matchingSections;
                if (sections.length > 0) {
                    setSelectedSection(sections[0]);
                    setSelectionTimestamp(Date.now());
                } else {
                    setSelectedSection(null);
                }
                return;
            }
        }
    }, [searchQuery, packFilteredCategories]);

    // Deep-link focus after tabs load.
    useEffect(() => {
        const focus = consumePendingGlossaryFocus();
        if (!focus) return;
        const tab = focus.tabId
            ? tabs.find((t) => t.id === focus.tabId)
            : tabs.find((t) => t.categories.some((c) =>
                c.id === focus.categoryId || c.sections.some((s) => s.id === focus.sectionId),
            ));
        if (tab) onSelectTabId(tab.id);
        const cats = tab?.categories ?? tabs.flatMap((t) => t.categories);
        const cat = focus.categoryId
            ? cats.find((c) => c.id === focus.categoryId)
            : cats.find((c) => c.sections.some((s) => s.id === focus.sectionId));
        if (cat) {
            setSelectedCategory(cat);
            const sec = focus.sectionId
                ? cat.sections.find((s) => s.id === focus.sectionId)
                : null;
            if (sec) {
                setSelectedSection(sec);
                setSelectionTimestamp(Date.now());
            }
        }
    }, [focusToken, tabs, onSelectTabId]);

    if (!activeTab) return null;

    return (
        <FocusDisabled>
            <div className={glossaryPanelTheme.container}>
                <div className={glossaryPanelTheme.topBar}>
                    <XtmGlossaryPackFilter
                        packs={tabPacks}
                        selectedPacks={selectedPacks}
                        onChange={setSelectedPacks}
                    />
                    <XtmGlossarySearch value={searchQuery} onChange={onSearchChange} />
                </div>
                <div className={glossaryPanelTheme.bottom}>
                    <XtmGlossaryCategoryBrowser
                        categories={packFilteredCategories}
                        selectedCategory={selectedCategory}
                        selectedCategoryIndex={selectedCategoryIndex}
                        searchQuery={searchQuery}
                        onCategorySelected={onCategorySelected}
                        onSectionSelected={onSectionSelected}
                    />
                    {selectedCategory && (
                        <XtmGlossaryContent
                            category={selectedCategory}
                            selectedSection={selectedSection}
                            searchQuery={searchQuery}
                            selectionTimestamp={selectionTimestamp}
                            onSectionSelected={onSectionSelected}
                        />
                    )}
                </div>
            </div>
        </FocusDisabled>
    );
}

