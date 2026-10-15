import {
    TILE_CATEGORIES,
    TILE_SIZE,
    WALL_PIECE_EDGES,
    type TileMeta,
    type WallPiece,
} from "@standin/contracts";
import {
    ALPHA_OFFSET,
    RGBA_CHANNELS,
} from "@/features/assets/consts/solidMask";
import type { PixelData } from "@/features/assets/utils/detectSolidMask";
import { WALL_SHEET_ORDER, WALL_SHEET_ROWS } from "../../consts/wallStyle";
import { detectWallMask, isEmptyMask, isWholeTile } from "./detectWallMask";
import { getPieceHeightTiles } from "./getPieceHeightTiles";

export const WALL_STYLE_ISSUES = {
    MISSING: "missing",
    SIZE: "size",
    EMPTY: "empty",
} as const;

export type WallStyleIssueKind =
    (typeof WALL_STYLE_ISSUES)[keyof typeof WALL_STYLE_ISSUES];

export type WallStyleIssue = { piece: WallPiece; kind: WallStyleIssueKind };

export type WallSheet = {
    width: number;
    height: number;
    data: Uint8ClampedArray;
};

type BuildResult =
    | { ok: true; sheet: WallSheet; tileMeta: TileMeta }
    | { ok: false; issues: WallStyleIssue[] };

type Params = {
    images: Partial<Record<WallPiece, PixelData>>;
    style: string;
};

const copyTile = (
    from: PixelData,
    fromTop: number,
    to: WallSheet,
    column: number,
    row: number
): void => {
    for (let y = 0; y < TILE_SIZE; y += 1) {
        for (let x = 0; x < TILE_SIZE; x += 1) {
            const source = ((fromTop + y) * from.width + x) * RGBA_CHANNELS;
            const target =
                ((row * TILE_SIZE + y) * to.width + column * TILE_SIZE + x) *
                RGBA_CHANNELS;
            for (let channel = 0; channel < RGBA_CHANNELS; channel += 1) {
                to.data[target + channel] = from.data[source + channel];
            }
        }
    }
};

const hasPixels = (pixels: PixelData): boolean => {
    for (let index = ALPHA_OFFSET; index < pixels.data.length; index += 4) {
        if (pixels.data[index] > 0) return true;
    }
    return false;
};

const findIssues = (images: Params["images"]): WallStyleIssue[] =>
    WALL_SHEET_ORDER.flatMap((piece): WallStyleIssue[] => {
        const image = images[piece];
        if (!image) return [{ piece, kind: WALL_STYLE_ISSUES.MISSING }];

        const width = TILE_SIZE;
        const height = TILE_SIZE * getPieceHeightTiles(piece);
        if (image.width !== width || image.height !== height) {
            return [{ piece, kind: WALL_STYLE_ISSUES.SIZE }];
        }
        return hasPixels(image)
            ? []
            : [{ piece, kind: WALL_STYLE_ISSUES.EMPTY }];
    });

// The sheet of a wall style from the images of its eight pieces, and the tile
// meta that goes with it. Each tall piece is cut in two: the cap goes on the top
// row and is the `top` of the base, which goes on the bottom row. The collision
// is read from the art of the base: a base that is drawn all over blocks the
// whole tile, and one with a trace blocks the cells of the trace, which a
// side piece uses so an object can still stand beside it.
export const buildWallSheet = ({ images, style }: Params): BuildResult => {
    const issues = findIssues(images);
    if (issues.length > 0) return { ok: false, issues };

    const columns = WALL_SHEET_ORDER.length;
    const sheet: WallSheet = {
        width: columns * TILE_SIZE,
        height: WALL_SHEET_ROWS * TILE_SIZE,
        data: new Uint8ClampedArray(
            columns * TILE_SIZE * WALL_SHEET_ROWS * TILE_SIZE * RGBA_CHANNELS
        ),
    };
    const tileMeta: TileMeta = {};

    WALL_SHEET_ORDER.forEach((piece, column) => {
        const image = images[piece] as PixelData;
        const isTall = getPieceHeightTiles(piece) > 1;
        const baseTop = isTall ? TILE_SIZE : 0;

        if (isTall) copyTile(image, 0, sheet, column, 0);
        copyTile(image, baseTop, sheet, column, 1);

        const mask = detectWallMask(image, baseTop);
        tileMeta[String(columns + column)] = {
            category: TILE_CATEGORIES.WALL,
            style,
            edges: [...WALL_PIECE_EDGES[piece]],
            ...(isTall ? { top: column } : {}),
            ...(isWholeTile(mask) ? { solid: true } : {}),
            ...(isWholeTile(mask) || isEmptyMask(mask)
                ? {}
                : { solidMask: mask }),
        };
    });

    return { ok: true, sheet, tileMeta };
};
