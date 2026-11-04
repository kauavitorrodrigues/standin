import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    PresenceStore,
    type PresenceEntry,
} from "../../presence/PresenceStore";
import { RoomStates } from "../../utils/roomStates";
import { RaisedHandSync } from "../RaisedHandSync";
import { SpaceInterests } from "../SpaceInterests";

const SPACE = "space-1";

const entry = (socketId: string): PresenceEntry => ({
    socketId,
    userId: `user-${socketId}`,
    name: socketId,
    profilePictureUrl: null,
    avatarSheetFileId: null,
    muted: false,
    headphones: false,
    focus: false,
    announcingSince: null,
    handRaisedSince: null,
});

const stand = (socketId: string, x: number) => {
    PresenceStore.add(SPACE, entry(socketId));
    SpaceInterests.update(SPACE, socketId, {
        x,
        y: 0,
        direction: "down",
        isSitting: false,
    });
};

describe("RaisedHandSync", () => {
    beforeEach(() => {
        PresenceStore.clear();
        SpaceInterests.clear();
        RoomStates.clear();
        RaisedHandSync.clear();
    });

    it("tells only the people within earshot, with when the hand went up", () => {
        stand("speaker", 0);
        stand("near", 100);
        stand("far", 2000);
        PresenceStore.setHandRaised(SPACE, "speaker", 1000);
        const send = vi.fn();

        RaisedHandSync.refreshAround(SPACE, "speaker", send);

        expect(send).toHaveBeenCalledTimes(1);
        expect(send).toHaveBeenCalledWith("near", {
            hands: [
                {
                    socketId: "speaker",
                    userId: "user-speaker",
                    raisedSince: 1000,
                },
            ],
        });
    });

    it("gives a listener who just got a position the hands, oldest first", () => {
        stand("late", 0);
        stand("b", 50);
        stand("a", 80);
        PresenceStore.setHandRaised(SPACE, "b", 2000);
        PresenceStore.setHandRaised(SPACE, "a", 1000);
        const send = vi.fn();

        RaisedHandSync.refreshOnMove(SPACE, "late", send);

        const payload = send.mock.calls[0]?.[1];
        expect(
            payload.hands.map((a: { socketId: string }) => a.socketId)
        ).toEqual(["a", "b"]);
    });

    it("does not repeat a list the socket already has", () => {
        stand("speaker", 0);
        stand("near", 100);
        PresenceStore.setHandRaised(SPACE, "speaker", 1000);
        const send = vi.fn();

        RaisedHandSync.refreshAround(SPACE, "speaker", send);
        RaisedHandSync.refreshAround(SPACE, "speaker", send);

        expect(send).toHaveBeenCalledTimes(1);
    });

    it("empties the list of who heard it when the hand goes down", () => {
        stand("speaker", 0);
        stand("near", 100);
        PresenceStore.setHandRaised(SPACE, "speaker", 1000);
        const send = vi.fn();
        RaisedHandSync.refreshAround(SPACE, "speaker", send);
        send.mockClear();

        PresenceStore.setHandRaised(SPACE, "speaker", null);
        RaisedHandSync.refreshAround(SPACE, "speaker", send);

        expect(send).toHaveBeenCalledWith("near", { hands: [] });
    });

    it("takes the hand out of the list of a listener who walked away", () => {
        stand("speaker", 0);
        stand("walker", 100);
        PresenceStore.setHandRaised(SPACE, "speaker", 1000);
        const send = vi.fn();
        RaisedHandSync.refreshAround(SPACE, "speaker", send);
        send.mockClear();

        SpaceInterests.update(SPACE, "walker", {
            x: 2500,
            y: 0,
            direction: "down",
            isSitting: false,
        });
        RaisedHandSync.refreshOnMove(SPACE, "walker", send);

        expect(send).toHaveBeenCalledWith("walker", { hands: [] });
    });

    it("clears the listeners when the person disconnects", () => {
        stand("speaker", 0);
        stand("near", 100);
        PresenceStore.setHandRaised(SPACE, "speaker", 1000);
        const send = vi.fn();
        RaisedHandSync.refreshAround(SPACE, "speaker", send);
        send.mockClear();

        PresenceStore.remove(SPACE, "speaker");
        SpaceInterests.remove(SPACE, "speaker");
        RaisedHandSync.forget(SPACE, "speaker", send);

        expect(send).toHaveBeenCalledWith("near", { hands: [] });
    });

    it("keeps a hand raised inside a private room away from outside", () => {
        stand("speaker", 0);
        stand("outside", 100);
        stand("inside", 120);
        RoomStates.cross(SPACE, "room-a", "speaker", "u1", "in");
        RoomStates.cross(SPACE, "room-a", "inside", "u2", "in");
        PresenceStore.setHandRaised(SPACE, "speaker", 1000);
        const send = vi.fn();

        RaisedHandSync.refreshAround(SPACE, "speaker", send);

        expect(send.mock.calls.map((call) => call[0])).toEqual(["inside"]);
    });
});
