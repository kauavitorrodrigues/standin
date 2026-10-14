import type { TILE_PALETTE_CATEGORIES } from "@/features/maps/__shared__/consts/tilePalette";

export type PaletteTileCategory = (typeof TILE_PALETTE_CATEGORIES)[number];

// A tile of a tileset that the palette shows: it has an entry in the tileMeta.
export type PaletteTile = {
    index: number;
    category: PaletteTileCategory;
    solid: boolean;
    hasTop: boolean;
};
