import { getModule } from "cs2/modding";
import { DependencyList, useLayoutEffect, useState } from "react";

export const ASSIGN_HOST_ATTR = "data-xtm-assign-host";
export const SLIDER_WRAP_ATTR = "data-xtm-slider-wrap";

export const infoRowClasses = getModule(
    "game-ui/game/components/selected-info-panel/shared-components/info-row/info-row.module.scss",
    "classes",
) as {
    infoRow: string;
    left: string;
    right: string;
    disableFocusHighlight: string;
};

export const infoSectionClasses = getModule(
    "game-ui/game/components/selected-info-panel/shared-components/info-section/info-section.module.scss",
    "classes",
) as {
    infoSection: string;
};

export const routeSliderClasses = getModule(
    "game-ui/game/components/selected-info-panel/selected-info-sections/route-sections/route-slider.module.scss",
    "classes",
) as { routeSlider: string };

export function firstClassToken(className: string | undefined): string | null {
    if (!className) return null;
    const token = className.split(/\s+/).find((c) => !!c);
    return token || null;
}

/** Cohtml has no CSS.escape; class tokens from CSS modules are safe identifiers. */
export function classSelector(className: string | undefined): string | null {
    const token = firstClassToken(className);
    if (!token || !/^[A-Za-z_][\w-]*$/.test(token)) return null;
    return `.${token}`;
}

export function findDirectChildByClass(
    parent: Element,
    className: string | undefined,
): HTMLElement | null {
    const token = firstClassToken(className);
    if (!token) return null;
    for (let i = 0; i < parent.children.length; i++) {
        const child = parent.children[i] as HTMLElement;
        if (child.classList?.contains(token)) return child;
    }
    return null;
}

/** Locate the vanilla InfoSection that contains a control (no sibling markers). */
export function findInfoSectionNear(nearClassName: string | undefined): HTMLElement | null {
    const nearSel = classSelector(nearClassName);
    if (!nearSel) return null;
    const near = document.querySelector(nearSel);
    if (!near) return null;

    const sectionSel = classSelector(infoSectionClasses.infoSection);
    if (sectionSel) {
        const section = near.closest(sectionSel);
        if (section) return section as HTMLElement;
    }
    return near.parentElement as HTMLElement | null;
}

export function ensureInfoRowRightHost(infoRow: Element): HTMLElement {
    let right = findDirectChildByClass(infoRow, infoRowClasses.right);
    if (!right) {
        right = document.createElement("div");
        if (infoRowClasses.right) right.className = infoRowClasses.right;
        right.setAttribute(ASSIGN_HOST_ATTR, "1");
        infoRow.appendChild(right);
    }
    return right;
}

/** Portal host on the InfoRow that already wraps a vanilla control (e.g. dropdown). */
export function resolveInfoRowRightHostNear(
    root: HTMLElement,
    nearClassName: string | undefined,
): HTMLElement | null {
    const nearSel = classSelector(nearClassName);
    if (!nearSel) return null;
    const near = root.querySelector(nearSel);
    if (!near) return null;

    const infoRowSel = classSelector(infoRowClasses.infoRow);
    const infoRow = infoRowSel ? near.closest(infoRowSel) : null;
    if (!infoRow) return null;

    return ensureInfoRowRightHost(infoRow);
}

/**
 * Vanilla ticket price puts the slider outside an InfoRow. Wrap it in left/right
 * so the assign cog aligns with other SIP right-column controls.
 */
export function resolveRouteSliderRightHost(root: HTMLElement): HTMLElement | null {
    const sliderSel = classSelector(routeSliderClasses.routeSlider);
    if (!sliderSel) return null;
    const slider = root.querySelector(sliderSel) as HTMLElement | null;
    if (!slider?.parentElement) return null;

    const existingWrap = slider.closest(`[${SLIDER_WRAP_ATTR}]`);
    if (existingWrap) {
        return ensureInfoRowRightHost(existingWrap);
    }

    const parent = slider.parentElement;
    const infoRow = document.createElement("div");
    infoRow.className = [
        infoRowClasses.infoRow,
        infoRowClasses.disableFocusHighlight,
    ].filter(Boolean).join(" ");
    infoRow.setAttribute(SLIDER_WRAP_ATTR, "1");

    const left = document.createElement("div");
    if (infoRowClasses.left) left.className = infoRowClasses.left;

    parent.insertBefore(infoRow, slider);
    left.appendChild(slider);
    infoRow.appendChild(left);

    return ensureInfoRowRightHost(infoRow);
}

export function cleanupSipAssignHosts(root: HTMLElement): void {
    root.querySelectorAll(`[${SLIDER_WRAP_ATTR}]`).forEach((wrap) => {
        const left = findDirectChildByClass(wrap, infoRowClasses.left) ?? wrap;
        const sliderSel = classSelector(routeSliderClasses.routeSlider);
        const slider = (sliderSel && left.querySelector(sliderSel)) as HTMLElement | null
            ?? (left.firstElementChild as HTMLElement | null);
        if (slider && wrap.parentElement) {
            wrap.parentElement.insertBefore(slider, wrap);
        }
        wrap.remove();
    });
    root.querySelectorAll(`[${ASSIGN_HOST_ATTR}]`).forEach((el) => el.remove());
}

/**
 * Find the live InfoSection by a unique inner class, inject a right-slot host, and
 * keep it synced. Renders no DOM at InfoSection sibling level.
 */
export function useSipAssignPortalHost(
    nearClassName: string | undefined,
    resolveHost: (section: HTMLElement) => HTMLElement | null,
    deps: DependencyList,
): HTMLElement | null {
    const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);

    useLayoutEffect(() => {
        let cancelled = false;
        let observed: HTMLElement | null = null;
        let observer: MutationObserver | null = null;

        const syncHost = () => {
            if (cancelled) return;
            const section = findInfoSectionNear(nearClassName);
            if (section !== observed) {
                observer?.disconnect();
                observer = null;
                observed = section;
                if (section) {
                    observer = new MutationObserver(syncHost);
                    observer.observe(section, { childList: true, subtree: true });
                }
            }
            if (!section) {
                setPortalHost(null);
                return;
            }
            const next = resolveHost(section);
            setPortalHost((prev) => (prev === next ? prev : next));
        };

        syncHost();
        const raf = requestAnimationFrame(syncHost);

        return () => {
            cancelled = true;
            cancelAnimationFrame(raf);
            observer?.disconnect();
            if (observed) cleanupSipAssignHosts(observed);
            setPortalHost(null);
        };
        // Caller passes a stable deps list for remount/resync.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return portalHost;
}
