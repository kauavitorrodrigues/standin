import type { FootprintMask } from "@standin/contracts";

// Which tiles of the footprint are occupied, one row per footprint row from
// top to bottom. Null means the whole rectangle.
export type FootprintMaskValue = FootprintMask | null;

// A tile of the footprint, counted from its top left corner.
export type FootprintTile = { col: number; row: number };

// Which cells of the footprint block the player, one row per cell row from top
// to bottom. A cell is a fraction of a tile. Null means the occupied tiles
// block as whole tiles.
export type SolidMaskValue = FootprintMask | null;

// A cell of the collision mask, counted from the top left corner of the
// footprint.
export type SolidCell = { col: number; row: number };

// What a stroke of the painter does to the cells it crosses.
export type SolidPaintAction = "paint" | "erase";

// The two masks of a footprint, which are always changed together.
export type FootprintMasks = {
    mask: FootprintMaskValue;
    solidMask: SolidMaskValue;
};
