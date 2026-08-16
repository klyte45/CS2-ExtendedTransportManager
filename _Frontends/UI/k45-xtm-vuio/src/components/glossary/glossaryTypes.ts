export type GlossarySectionDef = {
    id: string;
    titleKey: string;
    titleFallback: string;
    contentKey: string;
    contentFallback: string;
    tutorialId?: string;
};

export type GlossaryCategoryDef = {
    id: string;
    titleKey: string;
    titleFallback: string;
    icon?: string;
    packs: string[];
    /** Omit from the tree when Write Everywhere is unavailable. */
    requiresWe?: boolean;
    sections: GlossarySectionDef[];
};

export type GlossaryTabDef = {
    id: string;
    titleKey: string;
    titleFallback: string;
    icon: string;
    categories: GlossaryCategoryDef[];
};

export type GlossaryFocusRequest = {
    tabId?: string;
    categoryId?: string;
    sectionId?: string;
};
