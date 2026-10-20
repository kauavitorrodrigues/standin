import {
    AVATAR,
    TILE_SIZE,
    WALL_PIECES,
    type TileMeta,
    type WallPiece,
    type WallStyle,
} from "@standin/contracts";

// One tile of the test room: where it goes (in cells) and which tile of the
// sheet it is. A `top` tile is the cap above a facade, drawn over the avatars.
export type WallPreviewTile = {
    index: number;
    col: number;
    row: number;
    layer: "base" | "top";
};

// An avatar of the test room, as the feet (in px) and the side it stands on.
export type WallPreviewAvatar = {
    label: "atrás" | "na frente";
    x: number;
    feetY: number;
};

export type WallPreview = {
    tiles: WallPreviewTile[];
    avatars: WallPreviewAvatar[];
    cols: number;
    rows: number;
};

export const WALL_PREVIEW_COLS = 6;
export const WALL_PREVIEW_ROWS = 7;
// The base row of the north and of the south wall. The caps go one row above.
const NORTH_ROW = 1;
const SOUTH_ROW = 5;
const LAST_COL = WALL_PREVIEW_COLS - 1;
// The gap in px between the feet of an avatar of the test room and the south
// wall, on the side where it stands.
const WALL_GAP_PX = 2;

// Where each piece sits in the test room, the outline of a small room.
const getRing = (): { piece: WallPiece; col: number; row: number }[] => {
    const ring: { piece: WallPiece; col: number; row: number }[] = [
        { piece: WALL_PIECES.NW, col: 0, row: NORTH_ROW },
        { piece: WALL_PIECES.NE, col: LAST_COL, row: NORTH_ROW },
        { piece: WALL_PIECES.SW, col: 0, row: SOUTH_ROW },
        { piece: WALL_PIECES.SE, col: LAST_COL, row: SOUTH_ROW },
    ];
    for (let col = 1; col < LAST_COL; col += 1) {
        ring.push({ piece: WALL_PIECES.N, col, row: NORTH_ROW });
        ring.push({ piece: WALL_PIECES.S, col, row: SOUTH_ROW });
    }
    for (let row = NORTH_ROW + 1; row < SOUTH_ROW; row += 1) {
        ring.push({ piece: WALL_PIECES.W, col: 0, row });
        ring.push({ piece: WALL_PIECES.E, col: LAST_COL, row });
    }
    return ring;
};

// A small room built from the pieces of a style, with one avatar behind the
// south wall and one in front of it, so the cover can be checked before the
// tileset is saved. A piece the style lacks is left out, nothing breaks.
export const buildWallPreview = (
    meta: TileMeta,
    style: WallStyle
): WallPreview => {
    const tiles = getRing().flatMap(({ piece, col, row }) => {
        const tile = style.pieces[piece]?.[0];
        if (!tile) return [];
        const placed: WallPreviewTile[] = [
            { index: tile.index, col, row, layer: "base" },
        ];
        const top = meta[String(tile.index)]?.top;
        if (top !== undefined && row > 0) {
            placed.push({ index: top, col, row: row - 1, layer: "top" });
        }
        return placed;
    });
    const southTop = SOUTH_ROW * TILE_SIZE;
    const southBottom = (SOUTH_ROW + 1) * TILE_SIZE;
    const middle = Math.floor(WALL_PREVIEW_COLS / 2) * TILE_SIZE;

    return {
        tiles,
        avatars: [
            { label: "atrás", x: middle, feetY: southTop - WALL_GAP_PX },
            {
                label: "na frente",
                x: middle,
                // The whole body is under the wall, so it is not cut by it.
                feetY: southBottom + AVATAR.body.h + WALL_GAP_PX,
            },
        ],
        cols: WALL_PREVIEW_COLS,
        rows: WALL_PREVIEW_ROWS,
    };
};

// The stacking of a tile against the avatars: a base tile follows the bottom
// of its cell like the game does, and a cap is always on top.
export const getPreviewTileOrder = ({
    layer,
    row,
}: WallPreviewTile): number => {
    switch (layer) {
        case "top":
            return 10_000;
        default:
            return (row + 1) * TILE_SIZE;
    }
};
