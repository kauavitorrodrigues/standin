import { TILE_SIZE } from "../../maps/consts/constants";

/**
 * Tiles that fit one axis: margin on both ends, `spacing` between tiles.
 * Returns null when the axis is not an exact number of tiles.
 */
export const countTiles = (
    length: number,
    margin: number,
    spacing: number
): number | null => {
    const count = Math.floor(
        (length - 2 * margin + spacing) / (TILE_SIZE + spacing)
    );
    if (count < 1) return null;
    const used = 2 * margin + count * TILE_SIZE + (count - 1) * spacing;
    return used === length ? count : null;
};
