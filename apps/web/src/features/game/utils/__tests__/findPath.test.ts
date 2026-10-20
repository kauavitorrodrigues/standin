import { describe, expect, it } from "vitest";
import {
    findPath,
    findStep,
    getStandingPoint,
} from "@/features/game/utils/findPath";
import { getCellAt } from "@/features/game/utils/cell";
import type { Cell } from "@/features/game/types/cell";

type Point = { x: number; y: number };

const cell = (column: number, row: number): Cell => ({ column, row });

const search = (
    isFree: (point: Point) => boolean,
    goal: Cell,
    start: Cell = cell(0, 0)
) => findPath({ start, goal, columns: 6, rows: 6, isFree });

const outsideBlocks =
    (...blocked: Cell[]) =>
        (point: Point) => {
            const { column, row } = getCellAt(point);
            return !blocked.some((b) => b.column === column && b.row === row);
        };

// Whether every step of the path is one tile up, down, left or right.
const isCardinal = (path: Cell[]) =>
    path.every((tile, index) => {
        const before = path[index - 1];
        if (!before) return true;
        return (
            Math.abs(tile.column - before.column) +
                Math.abs(tile.row - before.row) ===
            1
        );
    });

const turns = (path: Cell[]) =>
    path.filter((tile, index) => {
        const before = path[index - 1];
        const after = path[index + 1];
        if (!before || !after) return false;
        return (
            after.column - tile.column !== tile.column - before.column ||
            after.row - tile.row !== tile.row - before.row
        );
    }).length;

describe("findPath", () => {
    it("walks a straight line tile by tile, both ends included", () => {
        expect(search(() => true, cell(3, 0))).toEqual([
            cell(0, 0),
            cell(1, 0),
            cell(2, 0),
            cell(3, 0),
        ]);
    });

    it("turns once for a goal in another row and column", () => {
        const path = search(() => true, cell(3, 3))!;

        expect(path).toHaveLength(7);
        expect(isCardinal(path)).toBe(true);
        expect(turns(path)).toBe(1);
    });

    it("goes around a blocked tile", () => {
        const isFree = outsideBlocks(cell(1, 0));

        const path = search(isFree, cell(2, 0))!;

        expect(path).not.toBeNull();
        expect(path).not.toContainEqual(cell(1, 0));
        expect(isCardinal(path)).toBe(true);
    });

    it("has no way into a blocked goal", () => {
        expect(search(outsideBlocks(cell(2, 2)), cell(2, 2))).toBeNull();
    });

    it("has no way when the goal is walled in", () => {
        const wall = [0, 1, 2, 3, 4, 5].map((row) => cell(1, row));

        expect(search(outsideBlocks(...wall), cell(3, 3))).toBeNull();
    });

    it("has no way to a goal outside the map", () => {
        expect(search(() => true, cell(6, 0))).toBeNull();
    });

    it("walks out from a start with no room", () => {
        const path = search(outsideBlocks(cell(0, 0)), cell(2, 0));

        expect(path?.at(-1)).toEqual(cell(2, 0));
    });

    it("stays put when the start is the goal", () => {
        expect(search(() => true, cell(0, 0))).toEqual([cell(0, 0)]);
    });
});

describe("getStandingPoint", () => {
    it("is the center of a free tile", () => {
        expect(getStandingPoint(cell(1, 1), () => true)).toEqual({
            x: 48,
            y: 48,
        });
    });

    it("moves down when the top of the tile is closed", () => {
        // A collision on the top 8 px of the tile, where the body reaches.
        const isFree = (point: Point) => point.y - 16 >= 32 + 8;

        expect(getStandingPoint(cell(1, 1), isFree)).toEqual({ x: 48, y: 56 });
    });

    it("keeps the feet inside the tile", () => {
        const point = getStandingPoint(cell(1, 1), (p) => p.y - 16 >= 32 + 15);

        expect(point).toBeNull();
    });

    it("is null when nothing fits", () => {
        expect(getStandingPoint(cell(1, 1), () => false)).toBeNull();
    });
});

describe("findStep", () => {
    const step = (to: Cell, isFree: (point: Point) => boolean) =>
        findStep({
            from: { x: 16, y: 16 },
            to,
            columns: 6,
            rows: 6,
            isFree,
        });

    it("ends on the center of a free tile", () => {
        expect(step(cell(1, 0), () => true)).toEqual({ x: 48, y: 16 });
    });

    it("is closed onto a blocked tile or outside the map", () => {
        expect(step(cell(1, 0), outsideBlocks(cell(1, 0)))).toBeNull();
        expect(step(cell(-1, 0), () => true)).toBeNull();
        expect(step(cell(0, 6), () => true)).toBeNull();
    });

    it("is closed by a thin solid halfway between two free centers", () => {
        // Only the point halfway, x = 32, is blocked.
        const isFree = (point: Point) => point.x !== 32;

        expect(step(cell(1, 0), isFree)).toBeNull();
    });

    it("walks on to a tile that is only open lower down", () => {
        const isFree = (point: Point) => point.x < 40 || point.y >= 20;

        expect(step(cell(1, 0), isFree)?.y).toBe(20);
    });
});
