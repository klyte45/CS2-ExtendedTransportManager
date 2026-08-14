const ELLIPSIS = "\u2026";
const MAX_LEN = 40;
const LAST_SEG_SOFT_MAX = 38;
const LAST_SEG_HARD_TRUNC = 37;

/**
 * Clamp a path-like palette name for assignment button row2.
 * Prefers keeping the last `/` segment; collapses the prefix with `…/`.
 */
export function clampPalettePathDisplay(name: string, maxLen = MAX_LEN): string {
    if (!name) return name;
    if (name.length <= maxLen) return name;

    const sep = name.lastIndexOf("/");
    if (sep < 0) {
        return name.length <= maxLen ? name : `${name.slice(0, maxLen - 1)}${ELLIPSIS}`;
    }

    const last = name.slice(sep + 1);
    if (last.length > LAST_SEG_SOFT_MAX) {
        return `${ELLIPSIS}/${last.slice(0, LAST_SEG_HARD_TRUNC)}`;
    }

    // Progressively drop leading segments until `…/suffix` fits.
    const parts = name.split("/");
    for (let drop = 1; drop < parts.length; drop++) {
        const suffix = parts.slice(drop).join("/");
        const candidate = `${ELLIPSIS}/${suffix}`;
        if (candidate.length <= maxLen) return candidate;
    }

    return `${ELLIPSIS}/${last.slice(0, Math.min(last.length, LAST_SEG_HARD_TRUNC))}`;
}
