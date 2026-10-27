import { beforeEach, describe, expect, it, vi } from "vitest";

const { emitToRoomMock } = vi.hoisted(() => ({ emitToRoomMock: vi.fn() }));

vi.mock("../../socketManager", () => ({
    SocketManager: { emitToRoom: emitToRoomMock },
}));

import { PresenceStore } from "../../presence/PresenceStore";
import { UserCache } from "@/features/auth/services/userCache";
import { broadcastNameChange } from "../broadcastNameChange";

const join = (spaceId: string, socketId: string, userId: string) =>
    PresenceStore.add(spaceId, {
        socketId,
        userId,
        name: "Old",
        profilePictureUrl: null,
        avatarSheetFileId: null,
    });

describe("broadcastNameChange", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        PresenceStore.clear();
        UserCache.clear();
    });

    it("emits space:name-changed to the room of each space where the person is", async () => {
        join("space-1", "s1", "user-a");
        join("space-2", "s2", "user-a");
        join("space-2", "s3", "user-b");

        await broadcastNameChange({ userId: "user-a", name: "Ana" });

        expect(emitToRoomMock).toHaveBeenCalledTimes(2);
        expect(emitToRoomMock).toHaveBeenCalledWith(
            "space:space-1",
            "space:name-changed",
            { userId: "user-a", name: "Ana" }
        );
        expect(emitToRoomMock).toHaveBeenCalledWith(
            "space:space-2",
            "space:name-changed",
            { userId: "user-a", name: "Ana" }
        );
    });

    it("emits once per space even with several tabs in it", async () => {
        join("space-1", "s1", "user-a");
        join("space-1", "s2", "user-a");

        await broadcastNameChange({ userId: "user-a", name: "Ana" });

        expect(emitToRoomMock).toHaveBeenCalledTimes(1);
    });

    it("emits nothing when the person is in no space", async () => {
        join("space-1", "s1", "user-b");

        await broadcastNameChange({ userId: "user-a", name: "Ana" });

        expect(emitToRoomMock).not.toHaveBeenCalled();
    });

    it("keeps the change in the presence for the next join", async () => {
        join("space-1", "s1", "user-a");

        await broadcastNameChange({ userId: "user-a", name: "Ana" });

        expect(PresenceStore.get("space-1", "s1")?.name).toEqual("Ana");
    });
});
