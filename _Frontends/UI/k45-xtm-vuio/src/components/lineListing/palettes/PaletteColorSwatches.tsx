import classNames from "classnames";
import { CSSProperties } from "react";

type Props = {
    colors: string[];
    maxSwatches?: number;
    className?: string;
};

const DEFAULT_MAX = 12;

export function PaletteColorSwatches({ colors, maxSwatches = DEFAULT_MAX, className }: Props) {
    const shown = colors.slice(0, maxSwatches);
    const extra = colors.length - shown.length;

    return (
        <div className={classNames("xtm-paletteCard_swatches", className)}>
            {shown.map((clr, i) => (
                <div
                    key={`${clr}_${i}`}
                    className="xtm-paletteCard_swatch"
                    style={{ "--swatchColor": clr } as CSSProperties}
                />
            ))}
            {extra > 0 && <div className="xtm-paletteCard_extra">{"+" + extra}</div>}
        </div>
    );
}
