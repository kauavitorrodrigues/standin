import { describe, expect, it } from "vitest";
import {
    buildDoorSolidRects,
    type WallRectsAt,
} from "@/features/game/utils/buildDoorSolidRects";

// A thin wall on the east edge of every cell of column 4, rows 0 to 1 and 5 to 6.
const eastWall: WallRectsAt = (column, row) =>
    column === 4 && (row <= 1 || (row >= 5 && row <= 6))
        ? [{ x: column * 32 + 24, y: row * 32, width: 8, height: 32 }]
        : null;

describe("buildDoorSolidRects", () => {
    it("carries the trace of the wall above across a door of three cells", () => {
        const rects = buildDoorSolidRects(
            { x: 4 * 32, y: 2 * 32, width: 32, height: 3 * 32 },
            eastWall
        );
        expect(rects).toEqual([
            { x: 4 * 32 + 24, y: 2 * 32, width: 8, height: 32 },
            { x: 4 * 32 + 24, y: 3 * 32, width: 8, height: 32 },
            { x: 4 * 32 + 24, y: 4 * 32, width: 8, height: 32 },
        ]);
    });

    it("returns null when no wall tile touches the door", () => {
        expect(
            buildDoorSolidRects(
                { x: 10 * 32, y: 10 * 32, width: 32, height: 32 },
                eastWall
            )
        ).toBeNull();
    });

    it("carries the trace of a horizontal wall along the width of the door", () => {
        const northWall: WallRectsAt = (column, row) =>
            row === 3 && (column === 1 || column === 4)
                ? [{ x: column * 32, y: row * 32 + 24, width: 32, height: 8 }]
                : null;
        const rects = buildDoorSolidRects(
            { x: 2 * 32, y: 3 * 32, width: 2 * 32, height: 32 },
            northWall
        );
        expect(rects).toEqual([
            { x: 2 * 32, y: 3 * 32 + 24, width: 32, height: 8 },
            { x: 3 * 32, y: 3 * 32 + 24, width: 32, height: 8 },
        ]);
    });

    it("uses the cells under a door that has a pixel offset", () => {
        const rects = buildDoorSolidRects(
            { x: 4 * 32, y: 2 * 32 + 6, width: 32, height: 32 },
            eastWall
        );
        // The door covers rows 2 and 3, and the wall touches it from row 1.
        expect(rects).toHaveLength(2);
    });
});
