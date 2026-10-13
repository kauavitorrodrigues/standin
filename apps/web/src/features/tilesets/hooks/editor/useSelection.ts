import { useState } from "react";
import type { TileMeta } from "@standin/contracts";
import type {
    SelectionMode,
    TileDirection,
    TileSheetGrid,
} from "../../types/sheet";
import { combineSelection } from "../../utils/editor/combineSelection";
import { findNextUntaggedTile } from "../../utils/editor/findNextUntaggedTile";
import { getNeighborTile } from "../../utils/editor/getNeighborTile";
import { getSelectedEntry } from "../../utils/editor/getSelectedEntry";
import { getTileFloodFill } from "../../utils/editor/getFloodFill";
import { getTilesOfSameCategory } from "../../utils/editor/getSameCategory";

type Params = {
    grid: TileSheetGrid;
    meta: TileMeta;
    // Brings a tile into sight, once the selection moves to it.
    reveal: (index: number) => void;
};

// The tiles that are selected and the one under the pointer, and the ways to
// change the selection: by category (the wand and the same category), with the
// arrow keys, or by jumping to the next tile that has no category.
export const useTileSelection = ({ grid, meta, reveal }: Params) => {
    const [selected, setSelected] = useState<number[]>([]);
    const [hovered, setHovered] = useState<number | null>(null);

    const single = selected.length === 1 ? selected[0]! : null;
    const selectedEntry = getSelectedEntry(meta, single);

    const selectArea = (area: number[], mode: SelectionMode) => {
        setSelected(combineSelection(selected, area, mode));
    };

    const selectTouching = (index: number, mode: SelectionMode) => {
        selectArea(getTileFloodFill(meta, index, grid), mode);
    };

    const selectSameCategory = (index: number, mode: SelectionMode) => {
        selectArea(getTilesOfSameCategory(meta, index, grid.tileCount), mode);
    };

    // The arrow keys move from the tile picked last, and with shift they add
    // the next one to the selection.
    const moveSelection = (direction: TileDirection, extend: boolean) => {
        const next = getNeighborTile(selected.at(-1) ?? 0, direction, grid);
        selectArea([next], extend ? "add" : "replace");
        reveal(next);
    };

    const selectNextUntagged = () => {
        const from = selected.length > 0 ? Math.max(...selected) : -1;
        const next = findNextUntaggedTile(
            meta,
            grid.tileCount,
            from < 0 ? grid.tileCount - 1 : from
        );
        if (next === null) return;
        setSelected([next]);
        reveal(next);
    };

    return {
        selected,
        setSelected,
        hovered,
        setHovered,
        single,
        selectedEntry,
        selectTouching,
        selectSameCategory,
        moveSelection,
        selectNextUntagged,
    };
};
