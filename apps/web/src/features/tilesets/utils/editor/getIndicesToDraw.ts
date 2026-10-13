import type { TileMeta } from "@standin/contracts";
import type { TileFilter } from "../../types/sheet";
import { isCategoryFilter } from "./filter";

type Params = {
    meta: TileMeta;
    filter: TileFilter;
    selected: number[];
    hovered: number | null;
    topTile: number | null;
    // What the tool in use would touch, shown before the click.
    preview: number[];
};

// The tiles that need an element over the sheet. A sheet can have thousands
// of cells, and most of them say nothing, so only these get one: the tiles
// with a category (only the highlighted category when the legend is on one),
// the ones selected, the ones a tool is about to touch, the one under the pointer and the top of
// the wall.
export const getTileIndicesToDraw = ({
    meta,
    filter,
    selected,
    hovered,
    topTile,
    preview,
}: Params): number[] => {
    const indices = new Set<number>();
    for (const [index, entry] of Object.entries(meta)) {
        const hidden = isCategoryFilter(filter) && entry.category !== filter;
        if (!hidden) indices.add(Number(index));
    }
    for (const index of selected) indices.add(index);
    if (hovered !== null) indices.add(hovered);
    for (const index of preview) indices.add(index);
    if (topTile !== null) indices.add(topTile);
    return [...indices].sort((a, b) => a - b);
};
