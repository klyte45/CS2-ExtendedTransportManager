import { PaletteData } from "#service/PaletteService";
import classNames from "classnames";
import { PaletteColorSwatches } from "./PaletteColorSwatches";

type Props = {
    palette: PaletteData;
    selected: boolean;
    onSelect: () => void;
};

export function PaletteListCard({ palette, selected, onSelect }: Props) {
    return (
        <button
            type="button"
            className={classNames("xtm-paletteCard", selected && "selected")}
            onClick={onSelect}
        >
            <div className="xtm-paletteCard_name">{palette.Name}</div>
            <PaletteColorSwatches colors={palette.ColorsRGB ?? []} maxSwatches={30} />
        </button>
    );
}
