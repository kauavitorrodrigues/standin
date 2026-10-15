import { describe, expect, it } from "vitest";
import { detectFootprintMask, type PixelData } from "../detectSolidMask";
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

describe("detectFootprintMask", () => {
    it("marks the cells covered by the drawing", () => {
        const pixels = paint(64, 32, [{ x: 0, y: 0, w: 8, h: 8, alpha: 255 }]);
        const result = detectFootprintMask(pixels, frame, footprint);
        expect(countSolidCells(result ?? [])).toBe(1);
        expect(result?.[0][0]).toBe(true);
    });

    it("needs a quarter of the pixels of a cell", () => {
        const enough = paint(64, 32, [{ x: 0, y: 0, w: 8, h: 2, alpha: 255 }]);
        const short = paint(64, 32, [{ x: 0, y: 0, w: 8, h: 1, alpha: 255 }]);
        expect(detectFootprintMask(enough, frame, footprint)?.[0][0]).toBe(
            true
        );
        expect(detectFootprintMask(short, frame, footprint)).toBeNull();
    });

    it("ignores nearly transparent pixels", () => {
        const faint = paint(64, 32, [{ x: 0, y: 0, w: 8, h: 8, alpha: 31 }]);
        const edge = paint(64, 32, [{ x: 0, y: 0, w: 8, h: 8, alpha: 32 }]);
        expect(detectFootprintMask(faint, frame, footprint)).toBeNull();
        expect(detectFootprintMask(edge, frame, footprint)?.[0][0]).toBe(true);
    });

    it("marks every cell of a footprint that is all drawn", () => {
        const pixels = paint(64, 32, [
            { x: 0, y: 0, w: 64, h: 32, alpha: 255 },
        ]);
        const result = detectFootprintMask(pixels, frame, footprint);
        expect(countSolidCells(result ?? [])).toBe(32);
    });

    it("reads the footprint where it sits on the frame", () => {
        const pixels = paint(64, 64, [{ x: 0, y: 0, w: 8, h: 8, alpha: 255 }]);
        const tall = { x: 0, y: 0, w: 64, h: 64 };
        const result = detectFootprintMask(pixels, tall, footprint);
        expect(result).toBeNull();
        const inside = paint(64, 64, [
            { x: 0, y: 32, w: 32, h: 32, alpha: 255 },
        ]);
        expect(
            countSolidCells(detectFootprintMask(inside, tall, footprint) ?? [])
        ).toBe(16);
    });

    it("is null when the drawing has nothing in the footprint", () => {
        const pixels = paint(64, 32, []);
        expect(detectFootprintMask(pixels, frame, footprint)).toBeNull();
    });
});
