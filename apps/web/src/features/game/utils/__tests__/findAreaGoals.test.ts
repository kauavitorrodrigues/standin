import { describe, expect, it } from "vitest";
import { findAreaGoals } from "@/features/game/utils/findAreaGoals";
import type { Cell } from "@/features/game/types/cell";

// Two by two tiles, from tile (2, 2).
const AREA = { x: 64, y: 64, width: 64, height: 64 };
const open = () => true;

describe("findAreaGoals", () => {
    it("lists the open tiles of the area, the closest to the click first", () => {
        const goals = findAreaGoals({
            area: AREA,
            click: { x: 120, y: 70 },
            freeSeats: [],
            isOpen: open,
        });

        expect(goals).toHaveLength(4);
        expect(goals[0]).toEqual({ column: 3, row: 2 });
    });

    it("puts the tile with a free seat before the closest one", () => {
        const goals = findAreaGoals({
            area: AREA,
            click: { x: 120, y: 70 },
            freeSeats: [{ x: 70, y: 120 }],
            isOpen: open,
        });

        expect(goals[0]).toEqual({ column: 2, row: 3 });
    });

    it("skips the closed tiles", () => {
        const isOpen = (cell: Cell) => !(cell.column === 3 && cell.row === 2);

        const goals = findAreaGoals({
            area: AREA,
            click: { x: 120, y: 70 },
            freeSeats: [],
            isOpen,
        });

        expect(goals).toHaveLength(3);
        expect(goals).not.toContainEqual({ column: 3, row: 2 });
    });

    it("has nothing when the whole area is closed", () => {
        expect(
            findAreaGoals({
                area: AREA,
                click: { x: 70, y: 70 },
                freeSeats: [],
                isOpen: () => false,
            })
        ).toEqual([]);
    });

    it("ignores a seat outside the area", () => {
        const goals = findAreaGoals({
            area: AREA,
            click: { x: 70, y: 70 },
            freeSeats: [{ x: 300, y: 300 }],
            isOpen: open,
        });

        expect(goals).toHaveLength(4);
        expect(goals[0]).toEqual({ column: 2, row: 2 });
    });
});
