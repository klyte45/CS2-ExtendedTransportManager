import { PaletteData } from "#service/PaletteService";
import classNames from "classnames";
import { CSSProperties } from "react";

type Props = {
    palette: PaletteData;
    selected: boolean;
    onSelect: () => void;
};

const MAX_SWATCHES = 12;

export function PaletteListCard({ palette, selected, onSelect }: Props) {
    const colors = palette.ColorsRGB ?? [];
    const shown = colors.slice(0, MAX_SWATCHES);
    const extra = colors.length - shown.length;

    return (
        <button
            type="button"
            className={classNames("xtm-paletteCard", selected && "selected")}
            onClick={onSelect}
        >
            <div className="xtm-paletteCard_name">{palette.Name}</div>
            <div className="xtm-paletteCard_swatches">
                {shown.map((clr, i) => (
                    <div
                        key={`${palette.GuidString}_${i}`}
                        className="xtm-paletteCard_swatch"
                        style={{ "--swatchColor": clr } as CSSProperties}
                    />
                ))}
                {extra > 0 && <div className="xtm-paletteCard_extra">{"+" + extra}</div>}
            </div>
        </button>
    );
}
