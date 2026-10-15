import { SOLID_MASK_SUBDIVISION } from "../consts/library";
import type { FootprintMask } from "../types/footprint-mask";

type MaskedFootprint = {
    w: number;
    h: number;
    mask?: FootprintMask | null;
};

/**
 * True when the tile mask of a footprint is absent, or has one row per
 * footprint row, one flag per footprint column and at least one occupied tile.
 * It is the mask the sprite editor works with, before it goes up as cells.
 */
export const isTileMaskFitting = ({ w, h, mask }: MaskedFootprint): boolean => {
    if (!mask) return true;
    if (mask.length !== h) return false;
    if (mask.some((row) => row.length !== w)) return false;
    return mask.some((row) => row.some(Boolean));
};

/**
 * True when the mask of a footprint is absent, or has SOLID_MASK_SUBDIVISION
 * rows and flags per footprint tile and at least one occupied cell.
 */
export const isFootprintMaskFitting = ({
    w,
    h,
    mask,
}: MaskedFootprint): boolean => {
    if (!mask) return true;
    if (mask.length !== h * SOLID_MASK_SUBDIVISION) return false;
    if (mask.some((row) => row.length !== w * SOLID_MASK_SUBDIVISION)) {
        return false;
    }
    return mask.some((row) => row.some(Boolean));
};

type SolidMaskedFootprint = MaskedFootprint & {
    solidMask?: FootprintMask | null;
};

/**
 * True when the collision mask of a footprint is absent, or has
 * SOLID_MASK_SUBDIVISION rows and flags per footprint tile, at least one solid
 * cell, and no solid cell where the footprint mask leaves the cell free.
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
        row.every((solid, x) => !solid || mask[y]?.[x] === true)
    );
};

/**
 * The footprint mask a tile mask stands for: every tile becomes a block of
 * SOLID_MASK_SUBDIVISION cells per side. Null when every tile is occupied.
 */
export const expandTileMask = (
    tileMask: FootprintMask | null | undefined
): FootprintMask | null => {
    if (!tileMask) return null;
    return tileMask.flatMap((row) => {
        const cells = row.flatMap((occupied) =>
            Array.from({ length: SOLID_MASK_SUBDIVISION }, () => occupied)
        );
        return Array.from({ length: SOLID_MASK_SUBDIVISION }, () => [
            ...cells,
        ]);
    });
};

/**
 * True when at least one cell of the tile at that column and row of the
 * footprint is occupied.
 */
export const isTileOccupiedByMask = (
    mask: FootprintMask | null | undefined,
    column: number,
    row: number
): boolean => {
    if (!mask) return true;
    return mask
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
        );
};
