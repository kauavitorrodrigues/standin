import { TILE_SIZE } from "@standin/contracts";

type Grid = { columns: number; margin: number; spacing: number };

// Top left pixel of a tile in the image, from its local index.
export const getTileOrigin = (index: number, grid: Grid) => ({
    x: grid.margin + (index % grid.columns) * (TILE_SIZE + grid.spacing),
    y:
        grid.margin +
        Math.floor(index / grid.columns) * (TILE_SIZE + grid.spacing),
});
