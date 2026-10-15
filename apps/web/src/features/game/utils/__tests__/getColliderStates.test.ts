import { describe, expect, it } from "vitest";
import { ROOM_DOOR_STATES } from "@standin/contracts";
import { getColliderStates } from "@/features/game/utils/getColliderStates";

const states = new Map([
    ["a", ROOM_DOOR_STATES.LOCKED],
    ["b", ROOM_DOOR_STATES.LOCKED],
]);

describe("getColliderStates", () => {
    it("keeps every state when the avatar is in no room", () => {
        expect(getColliderStates(states, null)).toBe(states);
    });

    it("lets the avatar out of the locked room it is inside", () => {
        const result = getColliderStates(states, "a");
        expect(result.get("a")).toBe(ROOM_DOOR_STATES.CLOSED);
        expect(result.get("b")).toBe(ROOM_DOOR_STATES.LOCKED);
    });

    it("leaves a room that is not locked as it is", () => {
        const open = new Map([["a", ROOM_DOOR_STATES.OPEN]]);
        expect(getColliderStates(open, "a")).toBe(open);
    });

    it("lets an entitled avatar into the locked rooms it may enter", () => {
        const result = getColliderStates(states, null, {
            all: false,
            roomKeys: new Set(["b"]),
        });
        expect(result.get("a")).toBe(ROOM_DOOR_STATES.LOCKED);
        expect(result.get("b")).toBe(ROOM_DOOR_STATES.CLOSED);
    });

    it("lets the owner into every locked room", () => {
        const result = getColliderStates(states, null, {
            all: true,
            roomKeys: new Set(),
        });
        expect(result.get("a")).toBe(ROOM_DOOR_STATES.CLOSED);
        expect(result.get("b")).toBe(ROOM_DOOR_STATES.CLOSED);
    });
});
