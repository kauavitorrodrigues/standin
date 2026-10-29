import { describe, expect, it } from "vitest";
import type { Cell } from "@/features/game/types/cell";
import { planWalk } from "@/features/game/utils/planWalk";

const cell = (column: number, row: number): Cell => ({ column, row });
const same = (a: Cell, b: Cell) => a.column === b.column && a.row === b.row;

const START = cell(0, 0);
const NO_NOISE = () => 0.5;

// A way that is only the two ends, for the tiles it is told to reach.
const reaches =
    (...reachable: Cell[]) =>
        (goal: Cell): Cell[] | null =>
            reachable.some((tile) => same(tile, goal)) ? [START, goal] : null;

const inMap = (tile: Cell) =>
    tile.column >= 0 && tile.column < 10 && tile.row >= 0 && tile.row < 10;

const search = (
    over: Partial<Parameters<typeof planWalk>[0]> & {
        findRoute: (goal: Cell) => Cell[] | null;
    }
) =>
    planWalk({
        goal: cell(5, 5),
        alternates: [],
        direction: null,
        isOpen: inMap,
        random: NO_NOISE,
        ...over,
    });

describe("planWalk", () => {
    it("walks to the goal when it is open and has a way", () => {
        const plan = search({ findRoute: reaches(cell(5, 5)) });

        expect(plan?.route.at(-1)).toEqual(cell(5, 5));
    });

    it("walks onto the tile of a person, since avatars do not collide", () => {
        const plan = search({
            goal: cell(1, 0),
            findRoute: (target) => [START, target],
        });

        expect(plan?.route.at(-1)).toEqual(cell(1, 0));
    });

    it("uses the open tile closest to a closed goal", () => {
        const plan = search({
            isOpen: (tile) => inMap(tile) && !same(tile, cell(5, 5)),
            findRoute: (goal) => [START, goal],
        });

        const end = plan!.route.at(-1)!;
        expect(Math.abs(end.column - 5) + Math.abs(end.row - 5)).toBe(1);
    });

    it("tries the open tile closest to the goal when the goal has no way", () => {
        const plan = search({
            findRoute: (goal) =>
                same(goal, cell(5, 5)) ? null : [START, goal],
        });

        const end = plan!.route.at(-1)!;
        expect(same(end, cell(5, 5))).toBe(false);
        expect(Math.abs(end.column - 5) + Math.abs(end.row - 5)).toBe(1);
    });

    it("goes on to the next goal and keeps the ones not tried", () => {
        const plan = search({
            goal: cell(5, 5),
            alternates: [cell(8, 8), cell(9, 9)],
            isOpen: (tile) =>
                same(tile, cell(5, 5)) ||
                same(tile, cell(8, 8)) ||
                same(tile, cell(9, 9)),
            findRoute: reaches(cell(8, 8)),
        });

        expect(plan?.route.at(-1)).toEqual(cell(8, 8));
        expect(plan?.alternates).toEqual([cell(9, 9)]);
    });

    it("keeps the goals that were not tried when the first one works", () => {
        const plan = search({
            alternates: [cell(8, 8)],
            findRoute: reaches(cell(5, 5)),
        });

        expect(plan?.alternates).toEqual([cell(8, 8)]);
    });

    it("skips a tile in a forbidden room", () => {
        const forbidden = (tile: Cell) => tile.column >= 5;
        const asked: Cell[] = [];
        const plan = search({
            isForbidden: forbidden,
            findRoute: (target) => {
                asked.push(target);
                return [START, target];
            },
        });

        expect(asked.every((tile) => !forbidden(tile))).toBe(true);
        expect(plan).not.toBeNull();
    });

    it("is null when no goal has a way", () => {
        expect(
            search({ alternates: [cell(8, 8)], findRoute: () => null })
        ).toBeNull();
    });
});
