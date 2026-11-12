import { describe, expect, it } from "vitest";
import type { Cell } from "@/features/game/types/cell";
import { planTeleport } from "@/features/game/utils/planTeleport";

const cell = (column: number, row: number): Cell => ({ column, row });
const same = (a: Cell, b: Cell) => a.column === b.column && a.row === b.row;

const ORIGIN = cell(0, 0);

const plan = (over: Partial<Parameters<typeof planTeleport>[0]> = {}) =>
    planTeleport({
        goal: cell(10, 0),
        origin: ORIGIN,
        maxDistance: 30,
        isOpen: () => true,
        isForbidden: () => false,
        ...over,
    });

describe("planTeleport", () => {
    it("jumps to an open tile in reach", () => {
        expect(plan()).toEqual(cell(10, 0));
    });

    it("never jumps to a closed tile", () => {
        expect(plan({ isOpen: () => false })).toBeNull();
    });

    it("does not swap a closed tile for one next to it", () => {
        const goal = cell(10, 0);
        expect(plan({ goal, isOpen: (tile) => !same(tile, goal) })).toBeNull();
    });

    it("never jumps into a locked room or a forbidden area", () => {
        const goal = cell(10, 0);
        expect(
            plan({ goal, isForbidden: (tile) => same(tile, goal) })
        ).toBeNull();
    });

    it("allows a tile at exactly the maximum distance", () => {
        expect(plan({ goal: cell(30, 0) })).toEqual(cell(30, 0));
        expect(plan({ goal: cell(18, 24) })).toEqual(cell(18, 24));
    });

    it("refuses a tile beyond the maximum distance", () => {
        expect(plan({ goal: cell(31, 0) })).toBeNull();
        expect(plan({ goal: cell(25, 25) })).toBeNull();
    });

    it("measures from the tile the avatar is on", () => {
        expect(plan({ origin: cell(40, 0), goal: cell(60, 0) })).toEqual(
            cell(60, 0)
        );
    });

    it("uses the distance of the game by default", () => {
        const search = {
            origin: ORIGIN,
            isOpen: () => true,
            isForbidden: () => false,
        };
        expect(planTeleport({ ...search, goal: cell(30, 0) })).toEqual(
            cell(30, 0)
        );
        expect(planTeleport({ ...search, goal: cell(31, 0) })).toBeNull();
    });

    it("does not jump to the tile the avatar is on", () => {
        expect(plan({ goal: ORIGIN })).toBeNull();
    });
});
