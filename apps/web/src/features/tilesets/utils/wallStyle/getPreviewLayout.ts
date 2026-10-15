import { TILE_SIZE, type WallPiece } from "@standin/contracts";
import {
    WALL_PREVIEW_COLUMNS,
    WALL_PREVIEW_ROWS,
    WALL_PREVIEW_SCALE,
    type WallPreviewCell,
} from "../../consts/wallPreview";
import { getPieceHeightTiles } from "./getPieceHeightTiles";

const TILE = TILE_SIZE * WALL_PREVIEW_SCALE;

export type PreviewBox = {
    left: number;
    top: number;
    width: number;
    height: number;
};

export const WALL_PREVIEW_WIDTH = WALL_PREVIEW_COLUMNS * TILE;
// One more row on top, where the caps of the first row rise.
export const WALL_PREVIEW_HEIGHT = (WALL_PREVIEW_ROWS + 1) * TILE;

// Where a piece is drawn, in px. A tall piece has its cap on the row above its
// base, a side piece is only its base.
export const getPieceBox = (
    piece: WallPiece,
    { column, row }: WallPreviewCell
): PreviewBox => {
    const tiles = getPieceHeightTiles(piece);
    return {
        left: column * TILE,
        top: (row + 1 - (tiles - 1)) * TILE,
        width: TILE,
        height: tiles * TILE,
    };
};

// Where the base tile of a piece is, which is all that a place without an
// image needs, whatever the height of the piece.
export const getBaseBox = ({ column, row }: WallPreviewCell): PreviewBox => ({
    left: column * TILE,
    top: (row + 1) * TILE,
    width: TILE,
    height: TILE,
});

// The band that covers every place of a piece at once, for a piece that has no
// image yet: the whole length of the wall it will fill, one tile thick.
export const getBandBox = (cells: readonly WallPreviewCell[]): PreviewBox => {
    const boxes = cells.map(getBaseBox);
    const left = Math.min(...boxes.map((box) => box.left));
    const top = Math.min(...boxes.map((box) => box.top));
    const right = Math.max(...boxes.map((box) => box.left + box.width));
    const bottom = Math.max(...boxes.map((box) => box.top + box.height));

    return { left, top, width: right - left, height: bottom - top };
};

// The floor of the room. It spans every column, since a side piece is only a
// trace at the edge of its tile and the floor goes on under it.
export const getFloorBox = (): PreviewBox => ({
    left: 0,
    top: 2 * TILE,
    width: WALL_PREVIEW_COLUMNS * TILE,
    height: (WALL_PREVIEW_ROWS - 2) * TILE,
});
