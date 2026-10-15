import type { FootprintMask } from "@standin/contracts";

// Which cells of the footprint are occupied, one row per cell row from top to
// bottom. A cell is a fraction of a tile, SOLID_MASK_SUBDIVISION per side.
// Null means the whole rectangle.
export type FootprintMaskValue = FootprintMask | null;

// Which cells of the footprint block the player, one row per cell row from top
// to bottom. Null means the occupied cells block.
export type SolidMaskValue = FootprintMask | null;

// A cell of the footprint, counted from its top left corner.
export type SolidCell = { col: number; row: number };

// What a stroke of the painter does to the cells it crosses.
export type SolidPaintAction = "paint" | "erase";

// The grid a stroke of the painter changes: the cells the piece occupies, or
// the ones of them that block.
export type MaskLayer = "footprint" | "collision";

// The two masks of a footprint, which are always changed together.
export type FootprintMasks = {
    mask: FootprintMaskValue;
    solidMask: SolidMaskValue;
};
