import { describe, expect, it } from "vitest";
import {
    dropOutlinePixels,
    getSheetDominantColor,
} from "../admin/getSheetDominantColor";

const pixels = (...list: [number, number, number, number][]) =>
    Uint8Array.from(list.flat());

const repeat = (pixel: [number, number, number, number], times: number) =>
    Array.from({ length: times }, () => pixel);

describe("dropOutlinePixels", () => {
    it("removes the near black pixels and keeps the rest in order", () => {
        const kept = dropOutlinePixels(
            pixels([10, 10, 10, 255], [200, 20, 20, 255], [0, 0, 0, 0])
        );

        expect(Array.from(kept)).toEqual([200, 20, 20, 255]);
    });

    it("keeps a dark pixel when one channel is above the outline level", () => {
        const kept = dropOutlinePixels(pixels([10, 10, 120, 255]));

        expect(Array.from(kept)).toEqual([10, 10, 120, 255]);
    });
});

describe("getSheetDominantColor", () => {
    it("reads the color of the piece, not the outline around it", () => {
        const data = pixels(
            ...repeat([5, 5, 5, 255], 30),
            ...repeat([220, 38, 38, 255], 10)
        );

        expect(getSheetDominantColor(data)).toBe("#DC2626");
    });

    it("falls back to the dark color when the whole piece is dark", () => {
        const data = pixels(...repeat([20, 20, 20, 255], 8));

        expect(getSheetDominantColor(data)).toBe("#141414");
    });

    it("answers null when no pixel is visible", () => {
        const data = pixels(...repeat([0, 0, 0, 0], 8));

        expect(getSheetDominantColor(data)).toBeNull();
    });
});
