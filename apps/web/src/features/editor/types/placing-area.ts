import type { LibraryPaletteArea, Stamp } from "@standin/contracts";

// The area picked in the palette to place: its card and the stamp fetched for
// the version on that card.
export type PlacingArea = {
    area: LibraryPaletteArea;
    stamp: Stamp;
};
