import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchSocketsMock, inMock, emitToRoomMock } = vi.hoisted(() => ({
    fetchSocketsMock: vi.fn(),
    inMock: vi.fn(),
    emitToRoomMock: vi.fn(),
}));

vi.mock("../../socketManager", () => ({
    SocketManager: {
        get: () => ({ in: inMock }),
        emitToRoom: emitToRoomMock,
    },
}));

import { broadcastProfilePictureChange } from "../broadcastProfilePictureChange";

describe("broadcastProfilePictureChange", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        inMock.mockReturnValue({ fetchSockets: fetchSocketsMock });
    });

    it("emits space:profile-picture-changed to the room of each space where the person is", async () => {
        fetchSocketsMock.mockResolvedValue([
            { data: { spaceId: "space-1" } },
            { data: { spaceId: "space-2" } },
        ]);

        await broadcastProfilePictureChange({
            userId: "user-a",
            profilePictureUrl: "/files/f1",
        });

        expect(inMock).toHaveBeenCalledWith("user:user-a");
        expect(emitToRoomMock).toHaveBeenCalledTimes(2);
        expect(emitToRoomMock).toHaveBeenCalledWith(
            "space:space-1",
            "space:profile-picture-changed",
            { userId: "user-a", profilePictureUrl: "/files/f1" }
        );
        expect(emitToRoomMock).toHaveBeenCalledWith(
            "space:space-2",
            "space:profile-picture-changed",
            { userId: "user-a", profilePictureUrl: "/files/f1" }
        );
    });

    it("emits once per space even with several tabs in it", async () => {
        fetchSocketsMock.mockResolvedValue([
            { data: { spaceId: "space-1" } },
            { data: { spaceId: "space-1" } },
        ]);

        await broadcastProfilePictureChange({
            userId: "user-a",
            profilePictureUrl: null,
        });

        expect(emitToRoomMock).toHaveBeenCalledTimes(1);
    });

    it("emits nothing when the person is in no space", async () => {
        fetchSocketsMock.mockResolvedValue([
            { data: { spaceId: null } },
            { data: {} },
        ]);

        await broadcastProfilePictureChange({
            userId: "user-a",
            profilePictureUrl: null,
        });

        expect(emitToRoomMock).not.toHaveBeenCalled();
    });
});
