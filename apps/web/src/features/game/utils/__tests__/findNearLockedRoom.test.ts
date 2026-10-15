import { describe, expect, it } from "vitest";
import { ROOM_DOOR_STATES } from "@standin/contracts";
import { findNearLockedRoom } from "@/features/game/utils/findNearLockedRoom";

const doors = [
    { id: "d", roomKey: "r", x: 100, y: 100, width: 32, height: 32 },
];
const locked = new Map([["r", ROOM_DOOR_STATES.LOCKED]]);
const none = { all: false, roomKeys: new Set<string>() };
const base = {
    doors,
    point: { x: 150, y: 116 },
    states: locked,
    entitlements: none,
    insideRoomKey: null,
    reach: 32,
};

describe("findNearLockedRoom", () => {
    it("finds the locked room whose door is within reach", () => {
        expect(findNearLockedRoom(base)).toBe("r");
    });

    it("is null when the door is too far", () => {
        expect(
            findNearLockedRoom({ ...base, point: { x: 300, y: 116 } })
        ).toBeNull();
    });

    it("is null when the room is not locked", () => {
        const states = new Map([["r", ROOM_DOOR_STATES.CLOSED]]);
        expect(findNearLockedRoom({ ...base, states })).toBeNull();
    });

    it("is null when the avatar is entitled or is the owner", () => {
        const keyed = { all: false, roomKeys: new Set(["r"]) };
        expect(findNearLockedRoom({ ...base, entitlements: keyed })).toBeNull();
        const owner = { all: true, roomKeys: new Set<string>() };
        expect(findNearLockedRoom({ ...base, entitlements: owner })).toBeNull();
    });

    it("is null when the avatar is inside that room", () => {
        expect(findNearLockedRoom({ ...base, insideRoomKey: "r" })).toBeNull();
    });
});
