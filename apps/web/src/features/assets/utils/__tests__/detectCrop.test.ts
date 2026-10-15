import { describe, expect, it } from "vitest";
import { detectCrop } from "../detectCrop";
import type { PixelData } from "../detectSolidMask";

// An image of the given size with the drawn pixels of a rectangle.
const image = (
    width: number,
    height: number,
    drawn?: { x: number; y: number; w: number; h: number }
): PixelData => {
    const data = new Uint8ClampedArray(width * height * 4);
    if (drawn) {
        for (let y = drawn.y; y < drawn.y + drawn.h; y += 1) {
            for (let x = drawn.x; x < drawn.x + drawn.w; x += 1) {
                data[(y * width + x) * 4 + 3] = 255;
            }
        }
    }
    return { width, height, data };
};

describe("detectCrop", () => {
    it("is null for an image with nothing drawn", () => {
        expect(detectCrop(image(96, 96))).toBeNull();
    });

    it("grows the drawn area to whole tiles", () => {
        const pixels = image(160, 128, { x: 40, y: 10, w: 50, h: 70 });
        expect(detectCrop(pixels)).toEqual({ x: 32, y: 0, w: 64, h: 96 });
    });

    it("keeps an area that already sits on the grid", () => {
        const pixels = image(96, 96, { x: 32, y: 32, w: 32, h: 32 });
        expect(detectCrop(pixels)).toEqual({ x: 32, y: 32, w: 32, h: 32 });
    });

    it("stays inside the whole tiles of the image", () => {
        const pixels = image(100, 100, { x: 0, y: 0, w: 100, h: 100 });
        expect(detectCrop(pixels)).toEqual({ x: 0, y: 0, w: 96, h: 96 });
    });
});
