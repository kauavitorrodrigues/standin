import { describe, expect, it } from "vitest";
import { buildSolidIndex } from "@/features/game/utils/buildSolidIndex";

const BODY = { w: 24, h: 16 };
const SOLID = { x: 64, y: 64, width: 32, height: 32 };

describe("buildSolidIndex", () => {
    it("is blocked inside a solid and free far from it", () => {
        const isBlocked = buildSolidIndex([SOLID], BODY);

        expect(isBlocked({ x: 80, y: 80 })).toBe(true);
        expect(isBlocked({ x: 200, y: 200 })).toBe(false);
    });

    it("lets a body touch a solid without a margin", () => {
        const isBlocked = buildSolidIndex([SOLID], BODY);

        // Body right edge at 64, the left edge of the solid.
        expect(isBlocked({ x: 52, y: 80 })).toBe(false);
    });

    it("keeps clear of the solid by the margin", () => {
        const isBlocked = buildSolidIndex([SOLID], BODY, 1);

        expect(isBlocked({ x: 52, y: 80 })).toBe(true);
        expect(isBlocked({ x: 50, y: 80 })).toBe(false);
    });

    it("grows the margin below the feet too", () => {
        const isBlocked = buildSolidIndex([SOLID], BODY, 1);

        // Feet 0.5px above the solid: the body is clear, the margin is not.
        expect(isBlocked({ x: 80, y: 63.5 })).toBe(true);
        expect(isBlocked({ x: 80, y: 62 })).toBe(false);
    });

    it("finds a solid that spans several tiles", () => {
        const wide = { x: 0, y: 64, width: 320, height: 8 };
        const isBlocked = buildSolidIndex([wide], BODY);

        expect(isBlocked({ x: 250, y: 70 })).toBe(true);
    });
});
