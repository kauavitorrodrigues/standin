import { beforeEach, describe, expect, it, vi } from "vitest";

const { room, acquireRoom, leave, apply } = vi.hoisted(() => ({
    room: { hasPeer: vi.fn(), addPeer: vi.fn(), setAway: vi.fn() },
    acquireRoom: vi.fn(),
    leave: vi.fn(),
    apply: vi.fn(),
}));

vi.mock("../../MediaRuntime", () => ({
    MediaRuntime: { acquireRoom, leave },
}));
vi.mock("@/lib/socket/realtime/AnnouncerVideo", () => ({
    AnnouncerVideo: { apply },
}));

import { PresenceStore } from "@/lib/socket/presence/PresenceStore";
import { requireMediaContext } from "../mediaContext";

const socket = () =>
    ({
        id: "me",
        connected: true,
        data: { spaceId: "space-1", userId: "user-me" },
    }) as never;

const presence = (availability: "active" | "away") => ({
    socketId: "me",
    userId: "user-me",
    name: "me",
    profilePictureUrl: null,
    avatarSheetFileId: null,
    muted: false,
    headphones: false,
    focus: false,
    availability,
    customStatus: null,
    announcingSince: null,
    sharingVideoWithAnnouncerSince: null,
    handRaisedSince: null,
    activeInteractionObjectId: null,
});

beforeEach(() => {
    PresenceStore.clear();
    room.hasPeer.mockReset().mockReturnValue(false);
    room.addPeer.mockReset();
    room.setAway.mockReset();
    acquireRoom.mockReset().mockResolvedValue(room);
    apply.mockReset();
});

describe("requireMediaContext, a person who is away", () => {
    it("joins the media already away", async () => {
        PresenceStore.add("space-1", presence("away"));

        await requireMediaContext(socket());

        expect(room.setAway).toHaveBeenCalledWith("me", true);
    });

    it("joins the media in the office when the person is active", async () => {
        PresenceStore.add("space-1", presence("active"));

        await requireMediaContext(socket());

        expect(room.setAway).toHaveBeenCalledWith("me", false);
    });

    it("does not reset the state of a person who is already in the media", async () => {
        PresenceStore.add("space-1", presence("away"));
        room.hasPeer.mockReturnValue(true);

        await requireMediaContext(socket());

        expect(room.setAway).not.toHaveBeenCalled();
    });

    it("treats a missing presence as in the office", async () => {
        await requireMediaContext(socket());

        expect(room.setAway).toHaveBeenCalledWith("me", false);
    });
});
