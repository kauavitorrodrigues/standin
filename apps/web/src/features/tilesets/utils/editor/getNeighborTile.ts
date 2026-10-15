import type { TileDirection, TileSheetGrid } from "../../types/sheet";

// The tile next to another one in a direction, or the same tile at the edge of
// the sheet.
export const getNeighborTile = (
    index: number,
    direction: TileDirection,
    grid: Pick<TileSheetGrid, "columns" | "rows">
): number => {
    const column = index % grid.columns;
    const row = Math.floor(index / grid.columns);
    switch (direction) {
        case "left":
            return column > 0 ? index - 1 : index;
        case "right":
            return column < grid.columns - 1 ? index + 1 : index;
        case "up":
            return row > 0 ? index - grid.columns : index;
        case "down":
            return row < grid.rows - 1 ? index + grid.columns : index;
    }
};
