import type { LibraryPaletteArea } from "@standin/contracts";

// What the area ghost needs to draw itself: the area (for the thumbnail and
// the size), the top left corner of the rectangle in tiles and whether the
// spot is valid.
export type AreaGhostTarget = {
    area: LibraryPaletteArea;
    tileX: number;
    tileY: number;
    valid: boolean;
};
