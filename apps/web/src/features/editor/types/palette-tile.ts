import type { TILE_PALETTE_CATEGORIES } from "@/features/editor/consts/tilePalette";

export type PaletteTileCategory = (typeof TILE_PALETTE_CATEGORIES)[number];

// The wall style a palette tile stands for. A style is one entry of the
// palette, drawn with its front wall, and painting it lets the map pick the
// piece of each cell.
export type PaletteTileStyle = {
    name: string;
    // Local indexes of every piece of the style, to tell when the brush is one.
    pieceIndexes: number[];
    // The pieces the style still lacks. Empty when it is complete.
    missing: string[];
};

// A tile of a tileset that the palette shows: it has an entry in the tileMeta.
export type PaletteTile = {
    index: number;
    category: PaletteTileCategory;
    solid: boolean;
    hasTop: boolean;
    // Only a tile that stands for a wall style has it.
    style?: PaletteTileStyle;
};
