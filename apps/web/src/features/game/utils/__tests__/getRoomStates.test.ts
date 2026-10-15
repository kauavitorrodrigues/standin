import { describe, expect, it } from "vitest";
import { ROOM_DOOR_STATES } from "@standin/contracts";
import { getRoomStates } from "@/features/game/utils/getRoomStates";

const room = (key: string) => ({
    key,
    label: key,
    x: 0,
    y: 0,
    width: 10,
    height: 10,
});

describe("getRoomStates", () => {
    it("has an entry for every room, open when the server said nothing", () => {
        const known = new Map([["a", ROOM_DOOR_STATES.LOCKED]]);
        const result = getRoomStates(
            [room("a"), room("b")],
            (key) => known.get(key) ?? ROOM_DOOR_STATES.OPEN
        );
        expect([...result]).toEqual([
            ["a", ROOM_DOOR_STATES.LOCKED],
            ["b", ROOM_DOOR_STATES.OPEN],
        ]);
    });
});
