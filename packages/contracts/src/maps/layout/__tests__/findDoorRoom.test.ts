import { describe, expect, it } from "vitest";
import { TILE_SIZE } from "../../consts/constants";
import { LAYOUT_ZONE_KINDS } from "../../schemas/layout.schema";
import { DOOR_ROOM_REACH, findDoorRoom } from "../findDoorRoom";
import type { Zone } from "../zone";

const room = (overrides: Partial<Zone>): Zone => ({
    kind: LAYOUT_ZONE_KINDS.PRIVATE,
    key: "room-a",
    x: 320,
    y: 320,
    width: 320,
    height: 320,
    ...overrides,
});

const door = (x: number, y: number) => ({
    x,
    y,
    width: TILE_SIZE,
    height: TILE_SIZE,
});

describe("findDoorRoom with a rectangle", () => {
    const zones = [room({})];

    it("matches a door in the wall, on the edge", () => {
        expect(findDoorRoom(door(320, 320 + 128), zones)).toEqual({
            status: "room",
            roomKey: "room-a",
        });
    });

    it("matches a door a little outside the shape", () => {
        expect(findDoorRoom(door(320 - TILE_SIZE, 450), zones).status).toBe(
            "room"
        );
    });

    it("matches a door a little inside the shape", () => {
        expect(findDoorRoom(door(320 + 8, 450), zones).status).toBe("room");
    });

    it("ignores a door deep inside the room", () => {
        expect(findDoorRoom(door(448, 448), zones)).toEqual({
            status: "none",
        });
    });

    it("ignores a door far outside the room", () => {
        expect(
            findDoorRoom(
                door(320 - TILE_SIZE - DOOR_ROOM_REACH - 1, 450),
                zones
            )
        ).toEqual({ status: "none" });
    });
});

describe("findDoorRoom with a polygon", () => {
    // An L shape, points relative to the zone origin.
    const zones = [
        room({
            width: 0,
            height: 0,
            polygon: [
                { x: 0, y: 0 },
                { x: 320, y: 0 },
                { x: 320, y: 160 },
                { x: 160, y: 160 },
                { x: 160, y: 320 },
                { x: 0, y: 320 },
            ],
        }),
    ];

    it("matches a door on an edge of the polygon", () => {
        expect(findDoorRoom(door(320 + 160, 320 + 200), zones).status).toBe(
            "room"
        );
    });

    it("matches a door on the inner edge of the notch", () => {
        expect(findDoorRoom(door(320 + 160, 320 + 180), zones).status).toBe(
            "room"
        );
    });

    it("ignores a door in the notch the bounding box would cover", () => {
        expect(findDoorRoom(door(320 + 288, 320 + 288), zones)).toEqual({
            status: "none",
        });
    });

    it("ignores a door deep inside the polygon", () => {
        expect(findDoorRoom(door(320 + 64, 320 + 64), zones)).toEqual({
            status: "none",
        });
    });
});

describe("findDoorRoom with several zones", () => {
    it("is ambiguous at a corner shared by two rooms", () => {
        const zones = [
            room({ key: "a", x: 0, y: 0, width: 320, height: 320 }),
            room({ key: "b", x: 320, y: 320, width: 320, height: 320 }),
        ];

        expect(findDoorRoom(door(304, 304), zones)).toEqual({
            status: "ambiguous",
            roomKeys: ["a", "b"],
        });
    });

    it("ignores zones that are not private", () => {
        const zones = [room({ kind: LAYOUT_ZONE_KINDS.AREA })];

        expect(findDoorRoom(door(320, 450), zones)).toEqual({ status: "none" });
    });

    it("ignores a private zone without key", () => {
        const zones = [room({ key: undefined })];

        expect(findDoorRoom(door(320, 450), zones)).toEqual({ status: "none" });
    });

    it("picks the only room that reaches the door", () => {
        const zones = [room({ key: "a" }), room({ key: "b", x: 1600 })];

        expect(findDoorRoom(door(320, 450), zones)).toEqual({
            status: "room",
            roomKey: "a",
        });
    });
});
