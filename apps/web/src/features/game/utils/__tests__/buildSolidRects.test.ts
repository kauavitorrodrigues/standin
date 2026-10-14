import { describe, expect, it } from "vitest";
import { buildSolidRects } from "@/features/game/utils/buildSolidRects";

const placed = { tileX: 4, tileY: 5, offsetX: 0, offsetY: 0 };

describe("buildSolidRects", () => {
    it("is one rectangle over the footprint without masks", () => {
        expect(buildSolidRects(placed, { w: 2, h: 1 })).toEqual([
            { x: 128, y: 160, width: 64, height: 32 },
        ]);
    });

    it("follows the offset in px", () => {
        expect(
            buildSolidRects(
                { ...placed, offsetX: 10, offsetY: -6 },
                { w: 1, h: 1 }
            )
        ).toEqual([{ x: 138, y: 154, width: 32, height: 32 }]);
    });

    it("uses one rectangle per run of occupied tiles, merged by rows", () => {
        const mask = [
            [true, true, true],
            [true, false, false],
        ];
        expect(buildSolidRects(placed, { w: 3, h: 2, mask })).toEqual([
            { x: 128, y: 128, width: 96, height: 32 },
            { x: 128, y: 160, width: 32, height: 32 },
        ]);
    });

    it("uses cells of 8 px for a collision mask", () => {
        // One tile: a solid band of two cells on the left and the full height.
        const solidMask = Array.from({ length: 4 }, () => [
            true,
            true,
            false,
            false,
        ]);
        expect(buildSolidRects(placed, { w: 1, h: 1, solidMask })).toEqual([
            { x: 128, y: 160, width: 16, height: 32 },
        ]);
    });

    it("keeps separate rectangles for runs of different widths", () => {
        const solidMask = [
            [true, false, false, false],
            [true, true, false, false],
            [false, false, false, false],
            [false, false, false, true],
        ];
        expect(buildSolidRects(placed, { w: 1, h: 1, solidMask })).toEqual([
            { x: 128, y: 160, width: 8, height: 8 },
            { x: 128, y: 168, width: 16, height: 8 },
            { x: 152, y: 184, width: 8, height: 8 },
        ]);
    });

    it("prefers the collision mask over the tile mask", () => {
        const solidMask = Array.from({ length: 4 }, () => [
            true,
            false,
            false,
            false,
        ]);
        expect(
            buildSolidRects(placed, {
                w: 1,
                h: 1,
                mask: [[true]],
                solidMask,
            })
        ).toEqual([{ x: 128, y: 160, width: 8, height: 32 }]);
    });
});
