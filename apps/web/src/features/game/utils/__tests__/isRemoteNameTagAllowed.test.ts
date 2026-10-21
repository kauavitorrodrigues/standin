import { describe, expect, it } from "vitest";
import { ROOM_DOOR_STATES, type RoomDoorState } from "@standin/contracts";
import type { GameRoom } from "@/features/game/types/room";
import { isRemoteNameTagAllowed } from "../isRemoteNameTagAllowed";

const room: GameRoom = {
    key: "r1",
    label: "Room",
    x: 100,
    y: 100,
    width: 100,
    height: 100,
};

const inside = { x: 150, y: 150 };
const outside = { x: 10, y: 10 };

const base = {
    feet: inside,
    rooms: [room],
    getRoomState: (): RoomDoorState => ROOM_DOOR_STATES.LOCKED,
    localRoomKey: null as string | null,
    entitlements: { all: false, roomKeys: new Set<string>() },
    isDecorating: false,
    hasName: true,
    hasPosition: true,
};

describe("isRemoteNameTagAllowed", () => {
    it("hides the tag of someone inside a locked room, seen from outside", () => {
        expect(isRemoteNameTagAllowed(base)).toBe(false);
    });

    it("asks the state of the room the avatar stands in", () => {
        const asked: string[] = [];

        isRemoteNameTagAllowed({
            ...base,
            getRoomState: (key) => {
                asked.push(key);
                return ROOM_DOOR_STATES.OPEN;
            },
        });

        expect(asked).toEqual(["r1"]);
    });

    it("shows the tag when the room is not locked", () => {
        expect(
            isRemoteNameTagAllowed({
                ...base,
                getRoomState: () => ROOM_DOOR_STATES.OPEN,
            })
        ).toBe(true);
    });

    it("shows it when the local avatar is in the same room", () => {
        expect(isRemoteNameTagAllowed({ ...base, localRoomKey: "r1" })).toBe(
            true
        );
    });

    it("shows it when the local avatar may walk into the room", () => {
        expect(
            isRemoteNameTagAllowed({
                ...base,
                entitlements: { all: true, roomKeys: new Set() },
            })
        ).toBe(true);
    });

    it("shows the tag of someone outside every room without asking for a state", () => {
        let asked = false;

        const allowed = isRemoteNameTagAllowed({
            ...base,
            feet: outside,
            getRoomState: () => {
                asked = true;
                return ROOM_DOOR_STATES.LOCKED;
            },
        });

        expect(allowed).toBe(true);
        expect(asked).toBe(false);
    });

    it("hides the tag of a peer that has no position yet, even outside a room", () => {
        expect(
            isRemoteNameTagAllowed({
                ...base,
                feet: outside,
                hasPosition: false,
            })
        ).toBe(false);
    });
});
