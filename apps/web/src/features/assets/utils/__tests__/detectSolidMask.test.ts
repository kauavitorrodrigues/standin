import { describe, expect, it } from "vitest";
import { detectSolidMask, type PixelData } from "../detectSolidMask";
import { countSolidCells } from "../solidMask";

// An image of transparent pixels where the given rectangles get an alpha.
const paint = (
    width: number,
    height: number,
    rects: { x: number; y: number; w: number; h: number; alpha: number }[]
): PixelData => {
    const data = new Uint8ClampedArray(width * height * 4);
    for (const rect of rects) {
        for (let y = rect.y; y < rect.y + rect.h; y += 1) {
            for (let x = rect.x; x < rect.x + rect.w; x += 1) {
                data[(y * width + x) * 4 + 3] = rect.alpha;
            }
        }
    }
    return { width, height, data };
};

const frame = { x: 0, y: 0, w: 64, h: 32 };
const footprint = { w: 2, h: 1, offsetX: 0 };

describe("detectSolidMask", () => {
    it("marks the cells covered by the drawing", () => {
        const pixels = paint(64, 32, [{ x: 0, y: 0, w: 8, h: 8, alpha: 255 }]);
        const result = detectSolidMask(pixels, frame, footprint, null);
        expect(countSolidCells(result ?? [])).toBe(1);
        expect(result?.[0][0]).toBe(true);
    });

    it("needs a quarter of the pixels of a cell", () => {
        const enough = paint(64, 32, [{ x: 0, y: 0, w: 8, h: 2, alpha: 255 }]);
        const short = paint(64, 32, [{ x: 0, y: 0, w: 8, h: 1, alpha: 255 }]);
        expect(detectSolidMask(enough, frame, footprint, null)?.[0][0]).toBe(
            true
        );
        expect(detectSolidMask(short, frame, footprint, null)).toBeNull();
    });

    it("ignores nearly transparent pixels", () => {
        const faint = paint(64, 32, [{ x: 0, y: 0, w: 8, h: 8, alpha: 31 }]);
        const edge = paint(64, 32, [{ x: 0, y: 0, w: 8, h: 8, alpha: 32 }]);
        expect(detectSolidMask(faint, frame, footprint, null)).toBeNull();
        expect(detectSolidMask(edge, frame, footprint, null)?.[0][0]).toBe(
            true
        );
    });

    it("never marks a cell of a tile the mask leaves free", () => {
        const pixels = paint(64, 32, [
            { x: 0, y: 0, w: 64, h: 32, alpha: 255 },
        ]);
        const result = detectSolidMask(pixels, frame, footprint, [
            [true, false],
        ]);
        expect(countSolidCells(result ?? [])).toBe(16);
        expect(result?.[0][4]).toBe(false);
    });

    it("reads the footprint where it sits on the frame", () => {
        const pixels = paint(64, 64, [{ x: 0, y: 0, w: 8, h: 8, alpha: 255 }]);
        const tall = { x: 0, y: 0, w: 64, h: 64 };
        const result = detectSolidMask(pixels, tall, footprint, null);
        expect(result).toBeNull();
        const inside = paint(64, 64, [
            { x: 0, y: 32, w: 64, h: 32, alpha: 255 },
        ]);
        expect(
            countSolidCells(
                detectSolidMask(inside, tall, footprint, null) ?? []
            )
        ).toBe(32);
    });

    it("is null when the drawing has nothing in the footprint", () => {
        const pixels = paint(64, 32, []);
        expect(detectSolidMask(pixels, frame, footprint, null)).toBeNull();
    });
});
