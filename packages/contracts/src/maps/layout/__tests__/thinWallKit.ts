import { WALL_PIECES, WALL_PIECE_EDGES } from "../../../assets/enums/wall-edge";
import type { WallPiece } from "../../../assets/enums/wall-edge";
import type { LayoutLibrary } from "../library";
import { FLOOR_IMAGE_ID } from "./fixtures";

export const THIN_ID = "tileset-thin";
export const PIECE_ORDER: WallPiece[] = [
    WALL_PIECES.N,
    WALL_PIECES.NE,
    WALL_PIECES.E,
    WALL_PIECES.SE,
    WALL_PIECES.S,
    WALL_PIECES.SW,
    WALL_PIECES.W,
    WALL_PIECES.NW,
];
export const FACADES: WallPiece[] = [
    WALL_PIECES.N,
    WALL_PIECES.NE,
    WALL_PIECES.SE,
    WALL_PIECES.S,
    WALL_PIECES.SW,
    WALL_PIECES.NW,
];
// Tile 8 is the top drawn over a facade.
export const TOP_INDEX = 8;

export const buildMeta = (style: string, skip: WallPiece[] = []) =>
    Object.fromEntries(
        PIECE_ORDER.flatMap((piece, index) =>
            skip.includes(piece)
                ? []
                : [
                      [
                          String(index),
                          {
                              category: "WALL" as const,
                              style,
                              edges: [...WALL_PIECE_EDGES[piece]],
                              ...(FACADES.includes(piece)
                                  ? { top: TOP_INDEX }
                                  : {}),
                          },
                      ],
                  ]
        )
    );

export const buildLibrary = (skip: WallPiece[] = []): LayoutLibrary => ({
    tilesets: {
        [FLOOR_IMAGE_ID]: {
            id: FLOOR_IMAGE_ID,
            organizationId: null,
            tileCount: 4,
            tileMeta: {
                "0": { category: "FLOOR", blankDefault: true },
            },
        },
        [THIN_ID]: {
            id: THIN_ID,
            organizationId: null,
            tileCount: 9,
            tileMeta: buildMeta("Azul", skip),
        },
    },
});
