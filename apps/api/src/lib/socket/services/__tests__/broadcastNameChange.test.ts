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

import { broadcastNameChange } from "../broadcastNameChange";

describe("broadcastNameChange", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        inMock.mockReturnValue({ fetchSockets: fetchSocketsMock });
    });

    it("emits space:name-changed to the room of each space where the person is", async () => {
        fetchSocketsMock.mockResolvedValue([
            { data: { spaceId: "space-1" } },
            { data: { spaceId: "space-2" } },
        ]);

        await broadcastNameChange({ userId: "user-a", name: "Ana Souza" });

        expect(inMock).toHaveBeenCalledWith("user:user-a");
        expect(emitToRoomMock).toHaveBeenCalledTimes(2);
        expect(emitToRoomMock).toHaveBeenCalledWith(
            "space:space-1",
            "space:name-changed",
            { userId: "user-a", name: "Ana Souza" }
        );
        expect(emitToRoomMock).toHaveBeenCalledWith(
            "space:space-2",
            "space:name-changed",
            { userId: "user-a", name: "Ana Souza" }
        );
    });

    it("emits once per space even with several tabs in it", async () => {
        fetchSocketsMock.mockResolvedValue([
            { data: { spaceId: "space-1" } },
            { data: { spaceId: "space-1" } },
        ]);

        await broadcastNameChange({ userId: "user-a", name: "Ana" });

        expect(emitToRoomMock).toHaveBeenCalledTimes(1);
    });

    it("emits nothing when the person is in no space", async () => {
        fetchSocketsMock.mockResolvedValue([
            { data: { spaceId: null } },
            { data: {} },
        ]);

        await broadcastNameChange({ userId: "user-a", name: "Ana" });

        expect(emitToRoomMock).not.toHaveBeenCalled();
    });
});
