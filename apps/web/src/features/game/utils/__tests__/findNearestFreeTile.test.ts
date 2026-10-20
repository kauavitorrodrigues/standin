import { describe, expect, it } from "vitest";
import { findNearestFreeTile } from "@/features/game/utils/findNearestFreeTile";
import type { Cell } from "@/features/game/types/cell";

const cell = (column: number, row: number): Cell => ({ column, row });

// Open inside a 10 by 10 map, except for the listed tiles.
const openExcept =
    (...closed: Cell[]) =>
        (tile: Cell) =>
            tile.column >= 0 &&
        tile.column < 10 &&
        tile.row >= 0 &&
        tile.row < 10 &&
        !closed.some((c) => c.column === tile.column && c.row === tile.row);

const NO_NOISE = () => 0.5;
const RIGHT = { x: 1, y: 0 };

describe("findNearestFreeTile", () => {
    it("takes the tile next to the goal in the direction it faces", () => {
        const found = findNearestFreeTile({
            goal: cell(5, 5),
            direction: RIGHT,
            radius: 4,
            isOpen: openExcept(cell(5, 5)),
            random: NO_NOISE,
        });

        expect(found).toEqual(cell(6, 5));
    });

    it("looks around the goal when the tile in front is closed too", () => {
        const found = findNearestFreeTile({
            goal: cell(5, 5),
            direction: RIGHT,
            radius: 4,
            isOpen: openExcept(cell(5, 5), cell(6, 5)),
            random: NO_NOISE,
        });

        expect(found).not.toEqual(cell(6, 5));
        expect(
            Math.abs(found!.column - 5) + Math.abs(found!.row - 5)
        ).toBe(1);
    });

    it("prefers the closest open tile, by tiles walked", () => {
        const closed = [
            cell(5, 5),
            cell(4, 5),
            cell(6, 5),
            cell(5, 4),
            cell(5, 6),
        ];

        const found = findNearestFreeTile({
            goal: cell(5, 5),
            direction: null,
            radius: 4,
            isOpen: openExcept(...closed),
            random: NO_NOISE,
        });

        expect(
            Math.abs(found!.column - 5) + Math.abs(found!.row - 5)
        ).toBe(2);
    });

    it("lets noise pick between tiles at the same distance", () => {
        const isOpen = openExcept(cell(5, 5));
        const search = (random: () => number) =>
            findNearestFreeTile({
                goal: cell(5, 5),
                direction: null,
                radius: 4,
                isOpen,
                random,
            });
        let calls = 0;
        const rising = () => (calls++ % 2 === 0 ? 0 : 0.99);

        expect(search(NO_NOISE)).not.toBeNull();
        expect(search(rising)).not.toBeNull();
    });

    it("does not reach past the radius", () => {
        const found = findNearestFreeTile({
            goal: cell(5, 5),
            direction: null,
            radius: 1,
            isOpen: (tile) => tile.column === 8,
            random: NO_NOISE,
        });

        expect(found).toBeNull();
    });

    it("is null when every tile is closed", () => {
        expect(
            findNearestFreeTile({
                goal: cell(5, 5),
                direction: RIGHT,
                radius: 4,
                isOpen: () => false,
            })
        ).toBeNull();
    });
});
