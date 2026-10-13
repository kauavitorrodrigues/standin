import type { TileMeta } from "@standin/contracts";
import type { TileSheetGrid } from "../../../../types/sheet";
import { getTileCategoryLabel } from "../../../../utils/editor/getCategoryLabel";

type Props = {
    hovered: number | null;
    grid: TileSheetGrid;
    meta: TileMeta;
};

// The tile under the pointer: where it is on the sheet and what it is.
export const TileHoverInfo = ({ hovered, grid, meta }: Props) => {
    if (hovered === null) return null;

    const column = (hovered % grid.columns) + 1;
    const row = Math.floor(hovered / grid.columns) + 1;
    const category = meta[String(hovered)]?.category;

    return (
        <span className="truncate">
            Tile {hovered} · coluna {column}, linha {row} ·{" "}
            {getTileCategoryLabel(category)}
        </span>
    );
};
