import { TILE_SIZE } from "@standin/contracts";
import {
    ALPHA_OFFSET,
    RGBA_CHANNELS,
    SOLID_ALPHA_THRESHOLD,
} from "../consts/solidMask";
import type { Crop } from "../types/spriteGeometry";
import type { PixelData } from "./detectSolidMask";

const snapDown = (value: number) => Math.floor(value / TILE_SIZE) * TILE_SIZE;
const snapUp = (value: number) => Math.ceil(value / TILE_SIZE) * TILE_SIZE;

// The crop the drawing asks for: the smallest rectangle of whole tiles that
// holds every drawn pixel, so the transparent margin of the image is left out.
// Null when nothing is drawn.
export const detectCrop = (pixels: PixelData): Crop | null => {
    let left = pixels.width;
    let top = pixels.height;
    let right = -1;
    let bottom = -1;

    for (let y = 0; y < pixels.height; y += 1) {
        for (let x = 0; x < pixels.width; x += 1) {
            const alpha =
                pixels.data[
                    (y * pixels.width + x) * RGBA_CHANNELS + ALPHA_OFFSET
                ];
            if (alpha < SOLID_ALPHA_THRESHOLD) continue;
            left = Math.min(left, x);
            top = Math.min(top, y);
            right = Math.max(right, x);
            bottom = Math.max(bottom, y);
        }
    }
    if (right < 0) return null;

    const x = snapDown(left);
    const y = snapDown(top);
    return {
        x,
        y,
        w: Math.min(snapUp(right + 1), snapDown(pixels.width)) - x,
        h: Math.min(snapUp(bottom + 1), snapDown(pixels.height)) - y,
    };
};
