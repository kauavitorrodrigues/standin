import type { WallPiece } from "../enums/wall-edge";
import { TILE_CATEGORIES } from "../enums/tile-category";
import type { TileMeta } from "../schemas/tile-meta.schema";
import { ALL_WALL_PIECES, getWallPiece } from "./wallPiece";

// A tile of a wall style: its local index in the tileset and the piece it is.
export type WallStyleTile = {
    index: number;
    piece: WallPiece;
};

export type WallStyle = {
    name: string;
    // The tiles of the style by piece. A piece can have more than one tile.
    pieces: Partial<Record<WallPiece, WallStyleTile[]>>;
};

export type WallStyleReport = {
    name: string;
    missing: WallPiece[];
    isComplete: boolean;
};

// The styles named in a tile meta, in the order they first appear. A tile that
// is not a WALL, has no edges, or whose edges are not one of the eight pieces
// does not belong to any style.
export const getWallStyles = (meta: TileMeta): WallStyle[] => {
    const styles = new Map<string, WallStyle>();

    Object.entries(meta)
        .sort(([a], [b]) => Number(a) - Number(b))
        .forEach(([key, entry]) => {
            if (entry.category !== TILE_CATEGORIES.WALL) return;
            if (!entry.style || !entry.edges) return;
            const piece = getWallPiece(entry.edges);
            if (!piece) return;

            const style = styles.get(entry.style) ?? {
                name: entry.style,
                pieces: {},
            };
            const tiles = style.pieces[piece] ?? [];
            style.pieces[piece] = [...tiles, { index: Number(key), piece }];
            styles.set(entry.style, style);
        });

    return [...styles.values()];
};

// What a style still lacks to be a full outline: the eight pieces.
export const validateWallStyle = (style: WallStyle): WallStyleReport => {
    const missing = ALL_WALL_PIECES.filter(
        (piece) => (style.pieces[piece] ?? []).length === 0
    );

    return { name: style.name, missing, isComplete: missing.length === 0 };
};

export const isWallComplete = (style: WallStyle): boolean =>
    validateWallStyle(style).isComplete;

// The report of every style of a tile meta, so the editor can list what is
// missing per style. A tileset with no wall styles has no report.
export const validateWallStyles = (meta: TileMeta): WallStyleReport[] =>
    getWallStyles(meta).map(validateWallStyle);

