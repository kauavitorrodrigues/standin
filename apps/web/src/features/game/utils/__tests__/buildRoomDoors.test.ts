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
});
