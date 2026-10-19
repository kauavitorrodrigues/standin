import type { PixelRect } from "../types/editor";

// The tightest rectangle that holds every non-transparent pixel of an RGBA
// buffer, or null when every pixel is transparent.
export const getOpaqueBounds = (
    data: Uint8ClampedArray,
    width: number,
    height: number
): PixelRect | null => {
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            const alpha = data[(y * width + x) * 4 + 3];
            if (alpha === 0) continue;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
    }

    if (maxX < minX) return null;
    return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
};
