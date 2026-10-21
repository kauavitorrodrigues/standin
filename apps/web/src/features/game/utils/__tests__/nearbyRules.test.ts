import { describe, expect, it } from "vitest";
import { NEARBY_PALETTE } from "@/features/game/consts/nearby";
import { getNearbyColor } from "../getNearbyColor";
import { getNearbyOpacity } from "../getNearbyOpacity";
import { getNearbyRadius } from "../getNearbyRadius";

const TILE = 32;

describe("getNearbyOpacity", () => {
    it("is 1 for a lone bubble", () => {
        expect(getNearbyOpacity(0, 1)).toBe(1);
    });

    it("goes from 0.4 to 1 along two or three bubbles", () => {
        expect([getNearbyOpacity(0, 2), getNearbyOpacity(1, 2)]).toEqual([
            0.4, 1,
        ]);
        const three = [0, 1, 2].map((index) => getNearbyOpacity(index, 3));
        expect(three[0]).toBeCloseTo(0.4);
        expect(three[1]).toBeCloseTo(0.7);
        expect(three[2]).toBeCloseTo(1);
    });
});

describe("getNearbyColor", () => {
    it("is stable for an id and always inside the palette", () => {
        for (const id of ["a", "user-1", "", "ç".repeat(40), "x".repeat(500)]) {
            expect(getNearbyColor(id)).toBe(getNearbyColor(id));
            expect(NEARBY_PALETTE).toContain(getNearbyColor(id));
        }
    });
});

describe("getNearbyRadius", () => {
    it("is 12 tiles on a big map", () => {
        expect(getNearbyRadius(100 * TILE, 80 * TILE)).toBe(12 * TILE);
    });

    it("shrinks on a small map", () => {
        expect(getNearbyRadius(16 * TILE, 40 * TILE)).toBe(8 * TILE);
    });

    it("is never under 5 tiles", () => {
        expect(getNearbyRadius(4 * TILE, 4 * TILE)).toBe(5 * TILE);
        expect(getNearbyRadius(0, 0)).toBe(5 * TILE);
    });
});
