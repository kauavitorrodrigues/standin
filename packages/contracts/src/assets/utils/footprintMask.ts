import { SOLID_MASK_SUBDIVISION } from "../consts/library";
import type { FootprintMask } from "../types/footprint-mask";

type MaskedFootprint = {
    w: number;
    h: number;
    mask?: FootprintMask | null;
};

/**
 * True when the mask of a footprint is absent, or has one row per footprint
 * row, one flag per footprint column and at least one occupied cell.
 */
export const isFootprintMaskFitting = ({
    w,
    h,
    mask,
}: MaskedFootprint): boolean => {
    if (!mask) return true;
    if (mask.length !== h) return false;
    if (mask.some((row) => row.length !== w)) return false;
    return mask.some((row) => row.some(Boolean));
};

type SolidMaskedFootprint = MaskedFootprint & {
    solidMask?: FootprintMask | null;
};

/**
 * True when the collision mask of a footprint is absent, or has
 * SOLID_MASK_SUBDIVISION rows and flags per footprint tile, at least one solid
 * cell, and no solid cell inside a tile the footprint mask leaves free.
 */
export const isFootprintSolidMaskFitting = ({
    w,
    h,
    mask,
    solidMask,
}: SolidMaskedFootprint): boolean => {
    if (!solidMask) return true;
    if (solidMask.length !== h * SOLID_MASK_SUBDIVISION) return false;
    if (solidMask.some((row) => row.length !== w * SOLID_MASK_SUBDIVISION)) {
        return false;
    }
    if (!solidMask.some((row) => row.some(Boolean))) return false;
    if (!mask) return true;

    return solidMask.every((row, y) =>
        row.every((solid, x) => {
            if (!solid) return true;
            const tileRow = Math.floor(y / SOLID_MASK_SUBDIVISION);
            const tileColumn = Math.floor(x / SOLID_MASK_SUBDIVISION);
            return mask[tileRow]?.[tileColumn] === true;
        })
    );
};

/**
 * The tile mask a collision mask implies: a tile is occupied when at least one
 * of its cells is solid. Null when every tile is occupied.
 */
export const deriveTileMask = (
    solidMask: FootprintMask,
    w: number,
    h: number
): FootprintMask | null => {
    const tiles = Array.from({ length: h }, (_, row) =>
        Array.from({ length: w }, (_, column) =>
            solidMask
                .slice(
                    row * SOLID_MASK_SUBDIVISION,
                    (row + 1) * SOLID_MASK_SUBDIVISION
                )
                .some((cells) =>
                    cells
                        .slice(
                            column * SOLID_MASK_SUBDIVISION,
                            (column + 1) * SOLID_MASK_SUBDIVISION
                        )
                        .some(Boolean)
                )
        )
    );
    if (tiles.every((row) => row.every(Boolean))) return null;
    return tiles;
};
