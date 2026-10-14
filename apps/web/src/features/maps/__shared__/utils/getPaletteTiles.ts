import type { Tileset } from "@standin/contracts";
import { TILE_PALETTE_CATEGORIES } from "@/features/maps/__shared__/consts/tilePalette";
import type {
    PaletteTile,
    PaletteTileCategory,
} from "@/features/maps/__shared__/types/palette-tile";

const isPaletteCategory = (category: string): category is PaletteTileCategory =>
    (TILE_PALETTE_CATEGORIES as readonly string[]).includes(category);

// The tiles of a tileset that have an entry in the tileMeta and a category
// that can be painted, in the order of the image. With a category, only the
// tiles of it.
export const getPaletteTiles = (
    tileset: Pick<Tileset, "tileMeta">,
    category: PaletteTileCategory | null
): PaletteTile[] => {
    const tiles: PaletteTile[] = [];

    for (const [key, entry] of Object.entries(tileset.tileMeta ?? {})) {
        if (!isPaletteCategory(entry.category)) continue;
        if (category !== null && entry.category !== category) continue;

        tiles.push({
            index: Number(key),
            category: entry.category,
            solid: entry.solid === true,
            hasTop: entry.top !== undefined,
        });
    }

    return tiles.sort((a, b) => a.index - b.index);
};
