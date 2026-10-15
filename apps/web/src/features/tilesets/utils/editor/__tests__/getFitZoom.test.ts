import { describe, expect, it } from "vitest";
import { getFitZoom } from "../getFitZoom";

describe("getFitZoom", () => {
    it("opens at the default zoom when the sheet fits at it", () => {
        expect(getFitZoom(128, 1000)).toBe(3);
    });

    it("never goes above the default, however much room there is", () => {
        expect(getFitZoom(32, 5000)).toBe(3);
    });

    it("goes down to the largest zoom that fits", () => {
        // 256 px: 3x is 768 and 2x is 512, with 128 px of room kept at the sides.
        expect(getFitZoom(256, 700)).toBe(2);
        expect(getFitZoom(256, 1000)).toBe(3);
    });

    it("opens at the least zoom when not even that fits", () => {
        expect(getFitZoom(2000, 600)).toBe(1);
    });
});
