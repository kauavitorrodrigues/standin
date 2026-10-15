import { SOLID_MASK_SUBDIVISION } from "@standin/contracts";
import type { FootprintMaskValue } from "../types/footprintMask";
import type { Footprint } from "../types/spriteGeometry";

// How many cells a footprint has when none of them is left free.
export const countFootprintCells = (footprint: Footprint): number =>
    footprint.w * footprint.h * SOLID_MASK_SUBDIVISION ** 2;

// Every cell of the footprint occupied, which is how a footprint without a
// mask is.
export const fillMask = (footprint: Footprint): boolean[][] =>
    Array.from({ length: footprint.h * SOLID_MASK_SUBDIVISION }, () =>
        Array<boolean>(footprint.w * SOLID_MASK_SUBDIVISION).fill(true)
    );

// The occupied cells, with the ones of a missing mask worked out.
export const resolveMask = (
    footprint: Footprint,
    mask: FootprintMaskValue
): boolean[][] => mask ?? fillMask(footprint);

// How many cells are occupied.
export const countOccupiedCells = (
    footprint: Footprint,
    mask: FootprintMaskValue
): number => {
    if (!mask) return countFootprintCells(footprint);
    return mask.reduce((total, row) => total + row.filter(Boolean).length, 0);
};

// The mask in the shape the API takes: absent when every cell is occupied.
export const normalizeMask = (mask: boolean[][]): FootprintMaskValue => {
    if (mask.every((row) => row.every(Boolean))) return null;
    return mask;
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
