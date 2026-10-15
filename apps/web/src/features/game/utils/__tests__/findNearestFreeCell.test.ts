import { describe, expect, it } from "vitest";
import { TILE_SIZE } from "@standin/contracts";
import {
    findNearestFreeCell,
    isPositionBlocked,
} from "@/features/game/utils/findNearestFreeCell";

const bounds = { width: TILE_SIZE * 10, height: TILE_SIZE * 10 };
const radius = 8;
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
        expect(isPositionBlocked(center(3, 3), radius, [tile(3, 3)])).toBe(
            true
        );
        expect(isPositionBlocked(center(6, 6), radius, [tile(3, 3)])).toBe(
            false
        );
    });

    it("counts the radius: touching the edge blocks", () => {
        const edge = { x: tile(3, 3).x - radius + 1, y: center(3, 3).y };
        expect(isPositionBlocked(edge, radius, [tile(3, 3)])).toBe(true);
    });
});

describe("findNearestFreeCell", () => {
    it("takes the closest free neighbour of a solid cell", () => {
        const point = { x: center(3, 3).x + 4, y: center(3, 3).y };

        const free = findNearestFreeCell({
            point,
            solidRects: [tile(3, 3)],
            radius,
            bounds,
        });

        expect(free).toEqual(center(4, 3));
    });

    it("skips neighbours that are solid too", () => {
        const solidRects = [tile(3, 3), tile(4, 3), tile(2, 3), tile(3, 2)];

        const free = findNearestFreeCell({
            point: center(3, 3),
            solidRects,
            radius,
            bounds,
        });

        expect(free).toEqual(center(3, 4));
    });

    it("never leaves the map", () => {
        const free = findNearestFreeCell({
            point: center(0, 0),
            solidRects: [tile(0, 0)],
            radius,
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
            radius,
            bounds,
        });

        expect(free).toBeNull();
    });
});
