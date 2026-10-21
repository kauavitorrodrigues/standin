import { describe, expect, it } from "vitest";
import { ROOM_DOOR_STATES } from "@standin/contracts";
import { shouldShowNameTag } from "../shouldShowNameTag";

const none = { all: false, roomKeys: new Set<string>() };

const base = {
    isLocal: false,
    isDecorating: false,
    hasName: true,
    hasPosition: true,
    roomKey: null as string | null,
    roomState: ROOM_DOOR_STATES.OPEN,
    localRoomKey: null as string | null,
    entitlements: none,
};

describe("shouldShowNameTag", () => {
    it("shows the tag of someone in the open", () => {
        expect(shouldShowNameTag(base)).toBe(true);
    });

    it("hides a tag with no name yet", () => {
        expect(shouldShowNameTag({ ...base, hasName: false })).toBe(false);
        expect(
            shouldShowNameTag({ ...base, hasName: false, isLocal: true })
        ).toBe(false);
    });

    it("hides the tag of a peer whose position did not arrive yet", () => {
        expect(shouldShowNameTag({ ...base, hasPosition: false })).toBe(false);
    });

    it("does not wait for a position to show the tag of the local player", () => {
        expect(
            shouldShowNameTag({ ...base, isLocal: true, hasPosition: false })
        ).toBe(true);
    });

    it("always shows the tag of the local player", () => {
        expect(
            shouldShowNameTag({
                ...base,
                isLocal: true,
                isDecorating: true,
                roomKey: "r1",
                roomState: ROOM_DOOR_STATES.LOCKED,
            })
        ).toBe(true);
    });

    it("hides the tags of the others while the decorator is open", () => {
        expect(shouldShowNameTag({ ...base, isDecorating: true })).toBe(false);
    });

    it("hides the tag of someone in a locked room the local avatar is not in", () => {
        expect(
            shouldShowNameTag({
                ...base,
                roomKey: "r1",
                roomState: ROOM_DOOR_STATES.LOCKED,
            })
        ).toBe(false);
    });

    it("shows it when the local avatar is in the same locked room", () => {
        expect(
            shouldShowNameTag({
                ...base,
                roomKey: "r1",
                localRoomKey: "r1",
                roomState: ROOM_DOOR_STATES.LOCKED,
            })
        ).toBe(true);
    });

    it("shows it when the local avatar may walk into the locked room", () => {
        const roomKeys = new Set(["r1"]);
        expect(
            shouldShowNameTag({
                ...base,
                roomKey: "r1",
                roomState: ROOM_DOOR_STATES.LOCKED,
                entitlements: { all: false, roomKeys },
            })
        ).toBe(true);
        expect(
            shouldShowNameTag({
                ...base,
                roomKey: "r1",
                roomState: ROOM_DOOR_STATES.LOCKED,
                entitlements: { all: true, roomKeys: new Set() },
            })
        ).toBe(true);
    });

    it("shows the tag of someone in a room that is open or only closed", () => {
        [ROOM_DOOR_STATES.OPEN, ROOM_DOOR_STATES.CLOSED].forEach((state) => {
            expect(
                shouldShowNameTag({ ...base, roomKey: "r1", roomState: state })
            ).toBe(true);
        });
    });
});
