import type { Tileset } from "@standin/contracts";
import { getPaletteTiles } from "@/features/maps/__shared__/utils/getPaletteTiles";

// The tileset the tab opens on: the first one that has a tile with a
// category, or the first one when none has. The list must not be empty.
export const getDefaultTileset = (tilesets: Tileset[]): Tileset =>
    tilesets.find((tileset) => getPaletteTiles(tileset, null).length > 0) ??
    tilesets[0];
