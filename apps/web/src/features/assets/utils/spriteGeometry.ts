import { TILE_SIZE } from "@standin/contracts";
import type { Cell, Crop, Footprint } from "../types/spriteGeometry";

export const hasCrop = (crop: Crop) => crop.w > 0 && crop.h > 0;

// The footprint was marked, as opposed to the empty one before that.
export const hasFootprint = (footprint: Footprint) =>
    footprint.w > 0 && footprint.h > 0;

// The crop, in px, that covers both cells and everything between them.
export const getCropFromCells = (start: Cell, end: Cell): Crop => ({
    x: Math.min(start.col, end.col) * TILE_SIZE,
    y: Math.min(start.row, end.row) * TILE_SIZE,
    w: (Math.abs(end.col - start.col) + 1) * TILE_SIZE,
    h: (Math.abs(end.row - start.row) + 1) * TILE_SIZE,
});

// The footprint marked by dragging between two cells. It stays inside the
// crop and always reaches its bottom row, so only the top of the drag counts
// vertically.
export const getFootprintFromCells = (
    crop: Crop,
    start: Cell,
    end: Cell
): Footprint => {
    const firstCol = crop.x / TILE_SIZE;
    const lastCol = firstCol + crop.w / TILE_SIZE - 1;
    const firstRow = crop.y / TILE_SIZE;
    const lastRow = firstRow + crop.h / TILE_SIZE - 1;
    const clamp = (value: number, min: number, max: number) =>
        Math.min(Math.max(value, min), max);

    const left = clamp(Math.min(start.col, end.col), firstCol, lastCol);
    const right = clamp(Math.max(start.col, end.col), firstCol, lastCol);
    const top = clamp(Math.min(start.row, end.row), firstRow, lastRow);

    return {
        w: right - left + 1,
        h: lastRow - top + 1,
        offsetX: left - firstCol,
    };
};

// The footprint that covers a whole frame, which is the one a still piece
// starts with: the cells of it are then read from the drawing.
export const getFootprintOfFrame = (frame: Crop): Footprint => ({
    w: frame.w / TILE_SIZE,
    h: frame.h / TILE_SIZE,
    offsetX: 0,
});

// The footprint on the image, in px: it sits on the bottom rows of the crop,
// shifted right by `offsetX` tiles.
export const getFootprintRect = (crop: Crop, footprint: Footprint): Crop => ({
    x: crop.x + footprint.offsetX * TILE_SIZE,
    y: crop.y + crop.h - footprint.h * TILE_SIZE,
    w: footprint.w * TILE_SIZE,
    h: footprint.h * TILE_SIZE,
});

// One frame of the crop. A static asset is the whole crop, an animated one is
// a horizontal strip of equal frames, and the footprint lives in one of them.
// The crop itself when the strip does not split into frames of whole tiles,
// since a footprint cannot be marked on a fraction of a tile.
export const getFrameCrop = (crop: Crop, frameCount: number): Crop => {
    const frameW = crop.w / frameCount;
    return frameCount > 1 && frameW % TILE_SIZE === 0
        ? { ...crop, w: frameW }
        : crop;
};

// Whether the crop is made of `frameCount` frames of whole tiles. Always true
// for a static asset.
export const splitsIntoFrames = (crop: Crop, frameCount: number) =>
    frameCount <= 1 || (crop.w / frameCount) % TILE_SIZE === 0;

// The cells of a footprint drag, moved into the first frame. The drag stays in
// the frame where it started, so it can begin on any frame of the strip and
// still gives the position inside a frame, which is what the footprint is.
export const toFirstFrameCells = (
    crop: Crop,
    frame: Crop,
    start: Cell,
    end: Cell
): [Cell, Cell] => {
    const clamp = (value: number, min: number, max: number) =>
        Math.min(Math.max(value, min), max);
    const firstCol = crop.x / TILE_SIZE;
    const frameCols = frame.w / TILE_SIZE;
    const lastCol = firstCol + crop.w / TILE_SIZE - 1;

    const startCol = clamp(start.col, firstCol, lastCol);
    const index = Math.floor((startCol - firstCol) / frameCols);
    const offset = index * frameCols;
    const endCol = clamp(
        end.col,
        firstCol + offset,
        firstCol + offset + frameCols - 1
    );

    return [
        { col: startCol - offset, row: start.row },
        { col: endCol - offset, row: end.row },
    ];
};
