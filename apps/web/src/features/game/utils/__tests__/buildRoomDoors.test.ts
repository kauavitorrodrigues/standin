import { describe, expect, it } from "vitest";
import type { Zone } from "@standin/contracts";
import { buildRoomDoors } from "@/features/game/utils/buildRoomDoors";

const asset = (id: string, type: string, w = 1, h = 1) =>
    ({ id, type, footprint: { w, h } }) as never;
const placed = (
    id: string,
    assetId: string,
    tileX: number,
    tileY: number,
    offsetX = 0,
    offsetY = 0
) => ({
    id,
    assetId,
    tileX,
    tileY,
    offsetX,
    offsetY,
});
const room = (key: string, x: number, y: number): Zone => ({
    kind: "private",
    key,
    x,
    y,
    width: 96,
    height: 96,
});

const assets = new Map([
    ["door", asset("door", "DOOR", 2, 1)],
    ["tall", asset("tall", "DOOR", 1, 2)],
    ["desk", asset("desk", "DESK")],
]);

describe("buildRoomDoors", () => {
    it("builds a door in px tied to its room", () => {
        const doors = buildRoomDoors(
            [placed("d", "door", 4, 6, 3, 0)],
            assets,
            [room("a", 64, 96)]
        );
        expect(doors).toEqual([
            { id: "d", roomKey: "a", x: 131, y: 192, width: 64, height: 32 },
        ]);
    });

    it("counts the rows up from the anchor cell", () => {
        const [door] = buildRoomDoors([placed("d", "tall", 4, 6)], assets, [
            room("a", 64, 96),
        ]);
        expect(door?.y).toBe(160);
        expect(door?.height).toBe(64);
    });

    it("ignores objects that are not doors or have no asset", () => {
        expect(
            buildRoomDoors(
                [placed("x", "desk", 4, 6), placed("y", "none", 4, 6)],
                assets,
                [room("a", 64, 96)]
            )
        ).toEqual([]);
    });

    it("drops a door that matches no room or an ambiguous one", () => {
        expect(
            buildRoomDoors([placed("d", "door", 40, 40)], assets, [
                room("a", 64, 96),
            ])
        ).toEqual([]);
        expect(
            buildRoomDoors([placed("d", "door", 4, 6)], assets, [
                room("a", 64, 96),
                room("b", 64, 96),
            ])
        ).toEqual([]);
    });

    it("fills the solid rects from the wall tiles beside the door", () => {
        const doors = buildRoomDoors(
            [placed("d", "tall", 1, 2)],
            assets,
            [room("r1", 0, 0)],
            (column, row) =>
                column === 1 && row === 0
                    ? [{ x: 32 + 24, y: 0, width: 8, height: 32 }]
                    : null
        );
        expect(doors[0]?.solidRects).toEqual([
            { x: 32 + 24, y: 32, width: 8, height: 32 },
            { x: 32 + 24, y: 64, width: 8, height: 32 },
        ]);
    });

    it("leaves the solid rects out with no wall tile beside the door", () => {
        const doors = buildRoomDoors(
            [placed("d", "tall", 1, 2)],
            assets,
            [room("r1", 0, 0)],
            () => null
        );
        expect(doors[0]).not.toHaveProperty("solidRects");
    });
});
