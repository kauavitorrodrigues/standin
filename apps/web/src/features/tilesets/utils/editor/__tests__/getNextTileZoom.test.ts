import { describe, expect, it } from "vitest";
import { getNextTileZoom } from "../getNextTileZoom";

describe("getNextTileZoom", () => {
    it("steps in and out through the zooms", () => {
        expect(getNextTileZoom(3, 1)).toBe(4);
        expect(getNextTileZoom(4, 1)).toBe(6);
        expect(getNextTileZoom(3, -1)).toBe(2);
    });

    it("stops at the ends", () => {
        expect(getNextTileZoom(8, 1)).toBe(8);
        expect(getNextTileZoom(1, -1)).toBe(1);
    });
});
