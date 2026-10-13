import { describe, expect, it } from "vitest";
import { countTiles } from "../countTiles";

describe("countTiles", () => {
    it("counts tiles on a plain 32 px grid", () => {
        expect(countTiles(128, 0, 0)).toBe(4);
    });

    it("accounts for margin and spacing", () => {
        // 2 + 32 + 1 + 32 + 2
        expect(countTiles(69, 2, 1)).toBe(2);
    });

    it("returns null when the axis is not an exact number of tiles", () => {
        expect(countTiles(100, 0, 0)).toBeNull();
        expect(countTiles(16, 0, 0)).toBeNull();
    });
});
