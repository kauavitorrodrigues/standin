import { TILE_SHEET_VEIL } from "../../../../consts/sheetStyle";

type Props = { show: boolean };

// The shade over the whole sheet while the legend highlights one category.
export const CategoryVeil = ({ show }: Props) => {
    if (!show) return null;

    return (
        <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundColor: TILE_SHEET_VEIL }}
        />
    );
};
