import { TILE_SIZE } from "../../consts/constants";

export type PixelAnchor = {
    tileX: number;
    tileY: number;
    offsetX: number;
    offsetY: number;
};

// Turns the left edge and the bottom edge of a footprint, in world px, into
// the anchor cell plus the pixel offset from it (0 up to a tile minus one in
// each axis). The bottom edge of the anchor cell is `(tileY + 1) * TILE_SIZE`.
export const splitPixelAnchor = (left: number, bottom: number): PixelAnchor => {
    const x = Math.round(left);
    const y = Math.round(bottom);
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE) - 1;

    return {
        tileX,
        tileY,
        offsetX: x - tileX * TILE_SIZE,
        offsetY: y - (tileY + 1) * TILE_SIZE,
    };
};

// The same anchor moved by a distance in px. Moving back by the opposite
// distance gives the same place, whatever the split into cell and offset.
export const shiftPixelAnchor = (
    anchor: PixelAnchor,
    deltaX: number,
    deltaY: number
): PixelAnchor =>
    splitPixelAnchor(
        anchor.tileX * TILE_SIZE + anchor.offsetX + deltaX,
        (anchor.tileY + 1) * TILE_SIZE + anchor.offsetY + deltaY
    );

// Distance in px between two anchors.
export const pixelDistance = (
    from: PixelAnchor,
    to: PixelAnchor
): { x: number; y: number } => ({
    x: (to.tileX - from.tileX) * TILE_SIZE + to.offsetX - from.offsetX,
    y: (to.tileY - from.tileY) * TILE_SIZE + to.offsetY - from.offsetY,
});
