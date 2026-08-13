import engine from "cohtml/cohtml";

export type ShieldEnsureArgs = {
    type: string;
    isCargo: boolean;
    color: string;
    text: string;
    activity?: string;
    /** CSS length like "2px" / "2rem" / number of rem; baker treats as rem-like CSS border. */
    borderWidth?: string;
};

function parseBorderWidthPx(borderWidth?: string): number {
    if (!borderWidth) return 0;
    const n = parseFloat(borderWidth);
    if (!Number.isFinite(n)) return 0;
    // listing uses "2px"; treat bare numbers and rem the same at baker's LogicalRem scale
    return n;
}

function normalizeColor(color: string): string {
    if (!color) return "808080";
    let c = color.trim();
    if (c.startsWith("#")) c = c.slice(1);
    if (c.startsWith("rgba") || c.startsWith("rgb")) {
        const m = c.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
        if (m) {
            const r = Number(m[1]).toString(16).padStart(2, "0");
            const g = Number(m[2]).toString(16).padStart(2, "0");
            const b = Number(m[3]).toString(16).padStart(2, "0");
            return `${r}${g}${b}`.toUpperCase();
        }
    }
    if (c.length === 8) c = c.slice(0, 6);
    return c.toUpperCase();
}

export class ShieldImageService {
    static async ensure(args: ShieldEnsureArgs): Promise<string> {
        const url = await engine.call(
            "k45::xtm.shieldImage.ensure",
            args.type,
            !!args.isCargo,
            normalizeColor(args.color),
            args.text ?? "",
            args.activity ?? "activity-dayNight",
            parseBorderWidthPx(args.borderWidth),
        );
        return typeof url === "string" ? url : "";
    }

    static async clearAll(): Promise<number> {
        return (await engine.call("k45::xtm.shieldImage.clearAll")) ?? 0;
    }
}
