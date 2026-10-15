import {
    WALL_PIECES,
    getWallStyles,
    validateWallStyle,
    type Tileset,
    type WallStyle,
} from "@standin/contracts";
import { TILE_PALETTE_CATEGORIES } from "@/features/editor/consts/tilePalette";
import type {
    PaletteTile,
    PaletteTileCategory,
} from "@/features/editor/types/palette-tile";

const isPaletteCategory = (category: string): category is PaletteTileCategory =>
    (TILE_PALETTE_CATEGORIES as readonly string[]).includes(category);

const getPieceIndexes = (style: WallStyle): number[] =>
    Object.values(style.pieces).flatMap((tiles) =>
        (tiles ?? []).map(({ index }) => index)
    );

// The tile that stands for a style in the palette: its front wall, or the
// first piece when the style has none.
const getStyleCover = (style: WallStyle): number =>
    style.pieces[WALL_PIECES.S]?.[0]?.index ??
    Math.min(...getPieceIndexes(style));

// The tiles of a tileset that have an entry in the tileMeta and a category
// that can be painted, in the order of the image. With a category, only the
// tiles of it. The pieces of a wall style become one tile per style, so the
// palette lists what can be painted and not each piece.
export const getPaletteTiles = (
    tileset: Pick<Tileset, "tileMeta">,
    category: PaletteTileCategory | null
): PaletteTile[] => {
    const tiles: PaletteTile[] = [];
    const styles = getWallStyles(tileset.tileMeta ?? {});
    const styleByIndex = new Map(
        styles.flatMap((style) =>
            getPieceIndexes(style).map((index) => [index, style] as const)
        )
    );

    for (const [key, entry] of Object.entries(tileset.tileMeta ?? {})) {
        if (!isPaletteCategory(entry.category)) continue;
        if (category !== null && entry.category !== category) continue;

        const index = Number(key);
        const style = styleByIndex.get(index);
        if (style && getStyleCover(style) !== index) continue;

        tiles.push({
            index,
            category: entry.category,
            solid: entry.solid === true,
            hasTop: entry.top !== undefined,
            ...(style
                ? {
                    style: {
                        name: style.name,
                        pieceIndexes: getPieceIndexes(style),
                        missing: validateWallStyle(style).missing,
                    },
                }
                : {}),
        });
    }

    return tiles.sort((a, b) => a.index - b.index);
};
