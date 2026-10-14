import { TILE_SIZE } from "@standin/contracts";
import type { Cell, Crop, Footprint } from "../types/spriteGeometry";
import type { FootprintMaskValue, FootprintTile } from "../types/footprintMask";

// A footprint of a single tile has nothing to leave free.
export const canHaveMask = (footprint: Footprint) =>
    footprint.w * footprint.h > 1;

export const isTileOccupied = (
    mask: FootprintMaskValue,
    tile: FootprintTile
): boolean => {
    if (!mask) return true;
    return mask[tile.row]?.[tile.col] ?? false;
};

export const countOccupiedTiles = (
    footprint: Footprint,
    mask: FootprintMaskValue
): number => {
    if (!mask) return footprint.w * footprint.h;
    return mask.reduce((total, row) => total + row.filter(Boolean).length, 0);
};

// The mask in the shape the API takes: absent when every tile is occupied.
export const normalizeMask = (mask: boolean[][]): FootprintMaskValue => {
    if (mask.every((row) => row.every(Boolean))) return null;
    return mask;
};

// The mask after a click on a tile. The last occupied tile cannot be freed,
// since a footprint needs at least one, and a mask that ends up full goes
// back to null.
export const toggleMaskTile = (
    footprint: Footprint,
    mask: FootprintMaskValue,
    tile: FootprintTile
): FootprintMaskValue => {
    const isInside =
        tile.col >= 0 &&
        tile.col < footprint.w &&
        tile.row >= 0 &&
        tile.row < footprint.h;
    if (!isInside) return mask;

    const next = Array.from({ length: footprint.h }, (_, row) =>
        Array.from({ length: footprint.w }, (_, col) =>
            isTileOccupied(mask, { col, row })
        )
    );
    next[tile.row][tile.col] = !next[tile.row][tile.col];
    if (!next.some((row) => row.some(Boolean))) return mask;
    return normalizeMask(next);
};

// The tile of the footprint under a cell of the image, or null when the cell
// is outside the footprint. The footprint sits on the bottom rows of the
// frame, shifted right by its offset.
export const getTileAtCell = (
    frame: Crop,
    footprint: Footprint,
    cell: Cell
): FootprintTile | null => {
    const col = cell.col - frame.x / TILE_SIZE - footprint.offsetX;
    const row = cell.row - (frame.y + frame.h) / TILE_SIZE + footprint.h;
    if (col < 0 || col >= footprint.w) return null;
    if (row < 0 || row >= footprint.h) return null;
    return { col, row };
};

// The mask of a footprint as it goes up: none for an animated asset, which
// cannot have one, or when it is the whole rectangle.
export const toPayloadMask = (
    mask: FootprintMaskValue,
    isAnimated: boolean
): FootprintMaskValue => {
    if (isAnimated || !mask) return null;
    return normalizeMask(mask);
};

// The `mask` key of a footprint payload, or nothing when there is no mask.
export const buildMaskField = (mask: FootprintMaskValue) => {
    if (!mask) return {};
    return { mask };
};
