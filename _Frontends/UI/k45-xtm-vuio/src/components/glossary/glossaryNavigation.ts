import { trigger } from "cs2/api";
import { GlossaryFocusRequest } from "./glossaryTypes";

let pendingFocus: GlossaryFocusRequest | null = null;
let pendingFocusToken = 0;
let forceXtmGlossary = false;
const forceListeners = new Set<() => void>();
const focusListeners = new Set<() => void>();

export function getGlossaryFocusToken(): number {
    return pendingFocusToken;
}

export function consumeForceXtmGlossary(): boolean {
    if (!forceXtmGlossary) return false;
    forceXtmGlossary = false;
    return true;
}

export function consumePendingGlossaryFocus(): GlossaryFocusRequest | null {
    const next = pendingFocus;
    pendingFocus = null;
    return next;
}

export function subscribeForceXtmGlossary(listener: () => void): () => void {
    forceListeners.add(listener);
    return () => {
        forceListeners.delete(listener);
    };
}

export function subscribeGlossaryFocus(listener: () => void): () => void {
    focusListeners.add(listener);
    return () => {
        focusListeners.delete(listener);
    };
}

function openGlossaryPanel(): void {
    forceXtmGlossary = true;
    for (const listener of forceListeners) {
        listener();
    }
    // Typed bindings lag; vanilla TriggerBinding is game.showGlossaryPanel(int).
    trigger("game", "showGlossaryPanel", 0);
}

/** Open Glossary in XTM mode, optionally focusing a tab/category/section by stable id. */
export function openXtmGlossary(focus?: GlossaryFocusRequest | null): void {
    if (focus && (focus.tabId || focus.categoryId || focus.sectionId)) {
        pendingFocus = { ...focus };
        pendingFocusToken += 1;
        for (const listener of focusListeners) {
            listener();
        }
    }
    openGlossaryPanel();
}
