import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mediaDirty, MediaRuntime } from "@/lib/media/MediaRuntime";
import { PresenceStore } from "../../presence/PresenceStore";
import { AnnouncerVideo } from "../AnnouncerVideo";

const presence = (
    announcingSince: number | null,
    sharingSince: number | null
) => ({
    socketId: "a",
    userId: "user-a",
    name: "a",
    profilePictureUrl: null,
    avatarSheetFileId: null,
    muted: false,
    headphones: false,
    focus: false,
    announcingSince,
    sharingVideoWithAnnouncerSince: sharingSince,
    handRaisedSince: null,
});

const fakeRoom = (hasPeer: boolean) => ({
    hasPeer: vi.fn().mockReturnValue(hasPeer),
    setAnnouncerVideo: vi.fn(),
});

describe("AnnouncerVideo", () => {
    beforeEach(() => {
        PresenceStore.clear();
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("hands the presence to the media and plans the person again", () => {
        PresenceStore.add("space-1", presence(5, 7));
        const room = fakeRoom(true);
        vi.spyOn(MediaRuntime, "getRoom").mockReturnValue(room as never);
        const marked = vi.spyOn(mediaDirty, "markMoved");

        AnnouncerVideo.apply("space-1", "a");

        expect(room.setAnnouncerVideo).toHaveBeenCalledWith("a", {
            announcing: true,
            sharingVideoWithAnnouncer: true,
        });
        expect(marked).toHaveBeenCalledWith("space-1", "a");
    });

    it("does nothing for a person with no media session", () => {
        PresenceStore.add("space-1", presence(5, null));
        const room = fakeRoom(false);
        vi.spyOn(MediaRuntime, "getRoom").mockReturnValue(room as never);

        AnnouncerVideo.apply("space-1", "a");

        expect(room.setAnnouncerVideo).not.toHaveBeenCalled();
    });

    it("takes the camera back to private", () => {
        PresenceStore.add("space-1", presence(null, 7));
        const room = fakeRoom(true);
        vi.spyOn(MediaRuntime, "getRoom").mockReturnValue(room as never);

        AnnouncerVideo.stopSharing("space-1", "a");

        expect(
            PresenceStore.get("space-1", "a")?.sharingVideoWithAnnouncerSince
        ).toBeNull();
        expect(room.setAnnouncerVideo).toHaveBeenCalledWith("a", {
            announcing: false,
            sharingVideoWithAnnouncer: false,
        });
    });
});
