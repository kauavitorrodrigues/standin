import { TILE_SIZE } from "@standin/contracts";
import type { ImageSize } from "../queries/useImageSize";

// The size of one frame of a PNG. A static asset is the whole image, an
// animated one is a horizontal strip of `frameCount` equal frames. Null when
// the width does not divide into whole frames.
export const getFrameSize = (
    image: ImageSize,
    frameCount: number
): ImageSize | null => {
    if (frameCount < 1 || image.w % frameCount !== 0) return null;
    return { w: image.w / frameCount, h: image.h };
};

export const isMultipleOfTile = (size: ImageSize) =>
    size.w > 0 &&
    size.h > 0 &&
    size.w % TILE_SIZE === 0 &&
    size.h % TILE_SIZE === 0;

// The footprint has to sit inside the frame, in tiles.
export const footprintFitsFrame = (
    frame: ImageSize,
    footprint: { w: number; h: number; offsetX: number }
) =>
    footprint.offsetX + footprint.w <= frame.w / TILE_SIZE &&
    footprint.h <= frame.h / TILE_SIZE;
