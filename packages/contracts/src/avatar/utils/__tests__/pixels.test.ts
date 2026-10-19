import { describe, expect, it } from "vitest";
import { compositeOver } from "../compositeOver";

describe("compositeOver", () => {
    it("returns the destination for a transparent source", () => {
        expect(compositeOver([9, 9, 9, 0], [1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
    });

    it("returns a transparent pixel when both are transparent", () => {
        expect(compositeOver([9, 9, 9, 0], [1, 2, 3, 0])).toEqual([0, 0, 0, 0]);
    });

    it("returns the source for an opaque source", () => {
        expect(compositeOver([9, 8, 7, 255], [1, 2, 3, 255])).toEqual([
            9, 8, 7, 255,
        ]);
    });

    it("returns the source over a transparent destination", () => {
        expect(compositeOver([9, 8, 7, 100], [1, 2, 3, 0])).toEqual([
            9, 8, 7, 100,
        ]);
    });

    it("blends an intermediate alpha over an opaque pixel", () => {
        // alpha 128 over opaque: 255 * 255 total, color = (200*128*255 + 100*255*127) / (128*255 + 255*127)
        const result = compositeOver(
            [200, 200, 200, 128],
            [100, 100, 100, 255]
        );
        expect(result[3]).toBe(255);
        expect(result[0]).toBe(150);
    });

    it("keeps the straight color over a half transparent destination", () => {
        const result = compositeOver([200, 0, 0, 128], [0, 0, 200, 128]);
        // alpha: 128 + 128 * 127 / 255 = 191.7 -> 192
        expect(result[3]).toBe(192);
        expect(result[0]).toBeGreaterThan(result[2]);
    });
});
