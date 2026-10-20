import { describe, expect, it } from "vitest";
import { AVATAR, TILE_SIZE } from "@standin/contracts";
import {
    findNearestFreeCell,
    isPositionBlocked,
} from "@/features/game/utils/findNearestFreeCell";

const bounds = { width: TILE_SIZE * 10, height: TILE_SIZE * 10 };
const body = AVATAR.body;
const tile = (column: number, row: number) => ({
    x: column * TILE_SIZE,
    y: row * TILE_SIZE,
    width: TILE_SIZE,
    height: TILE_SIZE,
});
const center = (column: number, row: number) => ({
    x: (column + 0.5) * TILE_SIZE,
    y: (row + 0.5) * TILE_SIZE,
});

describe("isPositionBlocked", () => {
    it("is blocked inside a solid and free away from it", () => {
        expect(isPositionBlocked(center(3, 3), body, [tile(3, 3)])).toBe(true);
        expect(isPositionBlocked(center(6, 6), body, [tile(3, 3)])).toBe(false);
    });

    it("counts the width of the body: 1 px inside the edge blocks, touching does not", () => {
        const solid = tile(3, 3);
        const inside = { x: solid.x - body.w / 2 + 1, y: center(3, 3).y };
        const touching = { x: solid.x - body.w / 2, y: center(3, 3).y };

        expect(isPositionBlocked(inside, body, [solid])).toBe(true);
        expect(isPositionBlocked(touching, body, [solid])).toBe(false);
    });

    it("counts the height of the body above the feet only", () => {
        const solid = tile(3, 3);
        const below = { x: center(3, 3).x, y: solid.y + solid.height + 4 };
        const above = { x: center(3, 3).x, y: solid.y - 1 };

        expect(isPositionBlocked(below, body, [solid])).toBe(true);
        expect(isPositionBlocked(above, body, [solid])).toBe(false);
    });
});

describe("findNearestFreeCell", () => {
    it("takes the closest free neighbour of a solid cell", () => {
        const point = { x: center(3, 3).x + 4, y: center(3, 3).y };

        const free = findNearestFreeCell({
            point,
            solidRects: [tile(3, 3)],
            body,
            bounds,
        });

        expect(free).toEqual(center(4, 3));
    });

    it("skips neighbours that are solid too", () => {
        const solidRects = [tile(3, 3), tile(4, 3), tile(2, 3), tile(3, 2)];

        const free = findNearestFreeCell({
            point: center(3, 3),
            solidRects,
            body,
            bounds,
        });

        expect(free).toEqual(center(3, 4));
    });

    it("never leaves the map", () => {
        const free = findNearestFreeCell({
            point: center(0, 0),
            solidRects: [tile(0, 0)],
            body,
            bounds,
        });

        expect(free?.x).toBeGreaterThan(0);
        expect(free?.y).toBeGreaterThan(0);
        expect(free?.x).toBeLessThan(bounds.width);
    });

    it("is null when every cell is solid", () => {
        const free = findNearestFreeCell({
            point: center(1, 1),
            solidRects: [{ x: 0, y: 0, ...bounds }],
            body,
            bounds,
        });

        expect(free).toBeNull();
    });
});
