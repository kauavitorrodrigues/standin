import { beforeEach, describe, expect, it, vi } from "vitest";

const { emitToRoomMock } = vi.hoisted(() => ({ emitToRoomMock: vi.fn() }));

vi.mock("../../socketManager", () => ({
    SocketManager: { emitToRoom: emitToRoomMock },
}));

import { PresenceStore } from "../../presence/PresenceStore";
import { UserCache } from "@/features/auth/services/userCache";
import { broadcastAvatarChange } from "../broadcastAvatarChange";

const join = (spaceId: string, socketId: string, userId: string) =>
    PresenceStore.add(spaceId, {
        socketId,
        userId,
        name: "Old",
        profilePictureUrl: null,
        avatarSheetFileId: null,
        muted: true,
        headphones: false,
        focus: false,
    });

describe("broadcastAvatarChange", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        PresenceStore.clear();
        UserCache.clear();
    });

    it("emits space:avatar-changed to the room of each space where the person is", async () => {
        join("space-1", "s1", "user-a");
        join("space-2", "s2", "user-a");
        join("space-2", "s3", "user-b");

        await broadcastAvatarChange({ userId: "user-a", avatarSheetFileId: "file-1" });

        expect(emitToRoomMock).toHaveBeenCalledTimes(2);
        expect(emitToRoomMock).toHaveBeenCalledWith(
            "space:space-1",
            "space:avatar-changed",
            { userId: "user-a", avatarSheetFileId: "file-1" }
        );
        expect(emitToRoomMock).toHaveBeenCalledWith(
            "space:space-2",
            "space:avatar-changed",
            { userId: "user-a", avatarSheetFileId: "file-1" }
        );
    });

    it("emits once per space even with several tabs in it", async () => {
        join("space-1", "s1", "user-a");
        join("space-1", "s2", "user-a");

        await broadcastAvatarChange({ userId: "user-a", avatarSheetFileId: "file-1" });

        expect(emitToRoomMock).toHaveBeenCalledTimes(1);
    });

    it("emits nothing when the person is in no space", async () => {
        join("space-1", "s1", "user-b");

        await broadcastAvatarChange({ userId: "user-a", avatarSheetFileId: "file-1" });

        expect(emitToRoomMock).not.toHaveBeenCalled();
    });

    it("keeps the change in the presence for the next join", async () => {
        join("space-1", "s1", "user-a");

        await broadcastAvatarChange({ userId: "user-a", avatarSheetFileId: "file-1" });

        expect(PresenceStore.get("space-1", "s1")?.avatarSheetFileId).toEqual("file-1");
    });
});
