import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    PresenceStore,
    type PresenceEntry,
} from "../../presence/PresenceStore";
import { RoomStates } from "../../utils/roomStates";
import { AnnouncerSync } from "../AnnouncerSync";
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

describe("AnnouncerSync", () => {
    beforeEach(() => {
        PresenceStore.clear();
        SpaceInterests.clear();
        RoomStates.clear();
        AnnouncerSync.clear();
    });

    it("tells only the people within earshot, with the announcer's start", () => {
        stand("speaker", 0);
        stand("near", 100);
        stand("far", 2000);
        PresenceStore.setAnnouncing(SPACE, "speaker", 1000);
        const send = vi.fn();

        AnnouncerSync.refreshAround(SPACE, "speaker", send);

        expect(send).toHaveBeenCalledTimes(1);
        expect(send).toHaveBeenCalledWith("near", {
            announcers: [
                {
                    socketId: "speaker",
                    userId: "user-speaker",
                    announcingSince: 1000,
                },
            ],
        });
    });

    it("gives a listener who just got a position the announcers, oldest first", () => {
        stand("late", 0);
        stand("b", 50);
        stand("a", 80);
        PresenceStore.setAnnouncing(SPACE, "b", 2000);
        PresenceStore.setAnnouncing(SPACE, "a", 1000);
        const send = vi.fn();

        AnnouncerSync.refreshOnMove(SPACE, "late", send);

        const payload = send.mock.calls[0]?.[1];
        expect(
            payload.announcers.map((a: { socketId: string }) => a.socketId)
        ).toEqual(["a", "b"]);
    });

    it("does not repeat a list the socket already has", () => {
        stand("speaker", 0);
        stand("near", 100);
        PresenceStore.setAnnouncing(SPACE, "speaker", 1000);
        const send = vi.fn();

        AnnouncerSync.refreshAround(SPACE, "speaker", send);
        AnnouncerSync.refreshAround(SPACE, "speaker", send);

        expect(send).toHaveBeenCalledTimes(1);
    });

    it("empties the list of who heard it when the announcer stops", () => {
        stand("speaker", 0);
        stand("near", 100);
        PresenceStore.setAnnouncing(SPACE, "speaker", 1000);
        const send = vi.fn();
        AnnouncerSync.refreshAround(SPACE, "speaker", send);
        send.mockClear();

        PresenceStore.setAnnouncing(SPACE, "speaker", null);
        AnnouncerSync.refreshAround(SPACE, "speaker", send);

        expect(send).toHaveBeenCalledWith("near", { announcers: [] });
    });

    it("takes the announcer out of the list of a listener who walked away", () => {
        stand("speaker", 0);
        stand("walker", 100);
        PresenceStore.setAnnouncing(SPACE, "speaker", 1000);
        const send = vi.fn();
        AnnouncerSync.refreshAround(SPACE, "speaker", send);
        send.mockClear();

        SpaceInterests.update(SPACE, "walker", {
            x: 2500,
            y: 0,
            direction: "down",
            isSitting: false,
        });
        AnnouncerSync.refreshOnMove(SPACE, "walker", send);

        expect(send).toHaveBeenCalledWith("walker", { announcers: [] });
    });

    it("clears the listeners when the announcer disconnects", () => {
        stand("speaker", 0);
        stand("near", 100);
        PresenceStore.setAnnouncing(SPACE, "speaker", 1000);
        const send = vi.fn();
        AnnouncerSync.refreshAround(SPACE, "speaker", send);
        send.mockClear();

        PresenceStore.remove(SPACE, "speaker");
        SpaceInterests.remove(SPACE, "speaker");
        AnnouncerSync.forget(SPACE, "speaker", send);

        expect(send).toHaveBeenCalledWith("near", { announcers: [] });
    });

    it("keeps what is announced inside a private room away from outside", () => {
        stand("speaker", 0);
        stand("outside", 100);
        stand("inside", 120);
        RoomStates.cross(SPACE, "room-a", "speaker", "u1", "in");
        RoomStates.cross(SPACE, "room-a", "inside", "u2", "in");
        PresenceStore.setAnnouncing(SPACE, "speaker", 1000);
        const send = vi.fn();

        AnnouncerSync.refreshAround(SPACE, "speaker", send);

        expect(send.mock.calls.map((call) => call[0])).toEqual(["inside"]);
    });
});
