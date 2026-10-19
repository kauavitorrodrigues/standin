import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchSocketsMock, inMock, emitToRoomMock } = vi.hoisted(() => {
    const fetchSocketsMock = vi.fn();
    return {
        fetchSocketsMock,
        inMock: vi.fn(),
        emitToRoomMock: vi.fn(),
    };
});

vi.mock("../../socketManager", () => ({
    SocketManager: {
        get: () => ({ in: inMock }),
        emitToRoom: emitToRoomMock,
    },
}));

import { broadcastAvatarChange } from "../broadcastAvatarChange";

describe("broadcastAvatarChange", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        inMock.mockReturnValue({ fetchSockets: fetchSocketsMock });
    });

    it("emits space:avatar-changed to the room of the space of each connection", async () => {
        fetchSocketsMock.mockResolvedValue([
            { data: { spaceId: "space-1" } },
            { data: { spaceId: "space-2" } },
        ]);

        await broadcastAvatarChange({
            userId: "user-a",
            avatarSheetFileId: "file-1",
        });

        expect(inMock).toHaveBeenCalledWith("user:user-a");
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

    it("emits once per space even with several connections in it", async () => {
        fetchSocketsMock.mockResolvedValue([
            { data: { spaceId: "space-1" } },
            { data: { spaceId: "space-1" } },
        ]);

        await broadcastAvatarChange({
            userId: "user-a",
            avatarSheetFileId: null,
        });

        expect(emitToRoomMock).toHaveBeenCalledTimes(1);
    });

    it("carries null when the avatar was cleared", async () => {
        fetchSocketsMock.mockResolvedValue([{ data: { spaceId: "space-1" } }]);

        await broadcastAvatarChange({
            userId: "user-a",
            avatarSheetFileId: null,
        });

        expect(emitToRoomMock).toHaveBeenCalledWith(
            "space:space-1",
            "space:avatar-changed",
            { userId: "user-a", avatarSheetFileId: null }
        );
    });

    it("emits nothing for connections that are not in a space", async () => {
        fetchSocketsMock.mockResolvedValue([
            { data: { spaceId: null } },
            { data: {} },
        ]);

        await broadcastAvatarChange({
            userId: "user-a",
            avatarSheetFileId: "file-1",
        });

        expect(emitToRoomMock).not.toHaveBeenCalled();
    });
});
