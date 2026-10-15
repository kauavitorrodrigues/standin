import { describe, expect, it } from "vitest";
import { TILE_SIZE } from "../../consts/constants";
import { LAYOUT_ZONE_KINDS } from "../../schemas/layout.schema";
import {
    findDoorSlots,
    type DoorSide,
    type FindDoorSlotsInput,
} from "../findDoorSlots";
import { cellKey } from "../readWallCells";
import type { Zone } from "../zone";

const room = (
    key: string,
    column: number,
    row: number,
    columns: number,
    rows: number
): Zone => ({
    kind: LAYOUT_ZONE_KINDS.PRIVATE,
    key,
    x: column * TILE_SIZE,
    y: row * TILE_SIZE,
    width: columns * TILE_SIZE,
    height: rows * TILE_SIZE,
});

// Walls on the border of the room, except the cells in `holes`.
const wallsAround = (zone: Zone, holes: string[] = []): Set<string> => {
    const left = zone.x / TILE_SIZE;
    const top = zone.y / TILE_SIZE;
    const right = left + zone.width / TILE_SIZE - 1;
    const bottom = top + zone.height / TILE_SIZE - 1;
    const cells = new Set<string>();
    for (let column = left; column <= right; column++) {
        for (let row = top; row <= bottom; row++) {
            const onBorder =
                column === left ||
                column === right ||
                row === top ||
                row === bottom;
            if (onBorder) cells.add(cellKey(column, row));
        }
    }
    holes.forEach((hole) => cells.delete(hole));

    return cells;
};

const SIZES: Record<DoorSide, { w: number; h: number }> = {
    north: { w: 2, h: 1 },
    south: { w: 2, h: 1 },
    east: { w: 1, h: 2 },
    west: { w: 1, h: 2 },
};

const run = (overrides: Partial<FindDoorSlotsInput>) =>
    findDoorSlots({
        zones: [],
        wallCells: new Set(),
        sizeBySide: SIZES,
        mapColumns: 40,
        mapRows: 40,
        ...overrides,
    });

const a = room("a", 5, 5, 10, 8);

describe("findDoorSlots", () => {
    it("finds the one gap of a room, centered", () => {
        const walls = wallsAround(a, ["8,5", "9,5", "10,5"]);
        expect(run({ zones: [a], wallCells: walls })).toEqual([
            {
                roomKey: "a",
                side: "north",
                tileX: 8,
                tileY: 5,
                width: 2,
                height: 1,
            },
        ]);
    });

    it("finds two gaps on different sides, sorted", () => {
        const walls = wallsAround(a, ["8,5", "9,5", "5,10", "5,9", "5,8"]);
        const slots = run({ zones: [a], wallCells: walls });
        expect(slots.map((slot) => slot.side)).toEqual(["north", "west"]);
    });

    it("drops a gap too narrow for the door", () => {
        const walls = wallsAround(a, ["8,5"]);
        expect(run({ zones: [a], wallCells: walls })).toEqual([]);
    });

    it("gives no slots for a wall without a gap", () => {
        expect(run({ zones: [a], wallCells: wallsAround(a) })).toEqual([]);
    });

    it("gives no slots for a side with no wall at all", () => {
        expect(run({ zones: [a] })).toEqual([]);
    });

    it("accepts a gap at the corner", () => {
        const walls = wallsAround(a, ["5,5", "6,5"]);
        const slots = run({ zones: [a], wallCells: walls });
        expect(slots.filter((slot) => slot.side === "north")).toEqual([
            {
                roomKey: "a",
                side: "north",
                tileX: 5,
                tileY: 5,
                width: 2,
                height: 1,
            },
        ]);
    });

    it("puts a door at each end of a long gap", () => {
        const walls = wallsAround(a, [
            "6,5",
            "7,5",
            "8,5",
            "9,5",
            "10,5",
            "11,5",
        ]);
        const slots = run({ zones: [a], wallCells: walls });
        expect(slots.map((slot) => slot.tileX)).toEqual([6, 10]);
    });

    it("centers one door in a gap that is not twice its size", () => {
        const walls = wallsAround(a, ["6,5", "7,5", "8,5"]);
        const slots = run({ zones: [a], wallCells: walls });
        expect(slots).toHaveLength(1);
        expect(slots[0]?.tileX).toBe(6);
    });

    it("never overlaps two slots", () => {
        const walls = wallsAround(a, ["6,5", "7,5", "8,5", "9,5"]);
        const slots = run({ zones: [a], wallCells: walls });
        expect(slots.map((slot) => slot.tileX)).toEqual([6, 8]);
    });

    it("finds the gap of each room on a shared wall", () => {
        const left = room("left", 2, 2, 6, 6);
        const right = room("right", 7, 2, 6, 6);
        const walls = new Set([...wallsAround(left), ...wallsAround(right)]);
        ["7,4", "7,5"].forEach((cell) => walls.delete(cell));
        const slots = run({ zones: [left, right], wallCells: walls });
        expect(slots.map((slot) => [slot.roomKey, slot.side])).toEqual([
            ["left", "east"],
            ["right", "west"],
        ]);
    });

    it("skips a gap covered by an occupied cell", () => {
        const walls = wallsAround(a, ["8,5", "9,5"]);
        const occupiedCells = new Set([cellKey(9, 5)]);
        expect(run({ zones: [a], wallCells: walls, occupiedCells })).toEqual(
            []
        );
    });

    it("uses the rotated footprint on east and west walls", () => {
        const walls = wallsAround(a, ["14,8", "14,9", "5,6", "5,7"]);
        const slots = run({ zones: [a], wallCells: walls });
        expect(slots).toEqual([
            {
                roomKey: "a",
                side: "east",
                tileX: 14,
                tileY: 9,
                width: 1,
                height: 2,
            },
            {
                roomKey: "a",
                side: "west",
                tileX: 5,
                tileY: 7,
                width: 1,
                height: 2,
            },
        ]);
    });

    it("finds the wall on the line outside the zone edge", () => {
        const walls = wallsAround(room("a", 4, 4, 12, 10), ["8,4", "9,4"]);
        const slots = run({ zones: [a], wallCells: walls });
        expect(slots.filter((slot) => slot.side === "north")).toEqual([
            {
                roomKey: "a",
                side: "north",
                tileX: 8,
                tileY: 4,
                width: 2,
                height: 1,
            },
        ]);
    });

    it("drops doors that fall outside the map", () => {
        const edge = room("edge", 0, 0, 6, 6);
        const walls = wallsAround(edge, ["2,0", "3,0"]);
        expect(run({ zones: [edge], wallCells: walls, mapColumns: 3 })).toEqual(
            []
        );
        expect(run({ zones: [edge], wallCells: walls })).toHaveLength(1);
    });

    it("keeps a door at the map edge when it fits", () => {
        const edge = room("edge", 0, 0, 6, 6);
        const walls = wallsAround(edge, ["0,2", "0,3"]);
        const slots = run({ zones: [edge], wallCells: walls });
        expect(slots).toEqual([
            {
                roomKey: "edge",
                side: "west",
                tileX: 0,
                tileY: 3,
                width: 1,
                height: 2,
            },
        ]);
    });

    it("ignores zones that are not rooms", () => {
        const spawn = { ...a, kind: LAYOUT_ZONE_KINDS.SPAWN };
        const walls = wallsAround(a, ["8,5", "9,5"]);
        expect(run({ zones: [spawn], wallCells: walls })).toEqual([]);
    });
});
