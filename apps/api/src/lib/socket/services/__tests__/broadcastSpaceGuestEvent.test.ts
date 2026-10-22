import { beforeEach, describe, expect, it, vi } from "vitest";

const { emitToRoomMock, emitToUserMock, fetchSocketsMock, inMock } = vi.hoisted(
    () => {
        const fetchSocketsMock = vi.fn();
        return {
            emitToRoomMock: vi.fn(),
            emitToUserMock: vi.fn(),
            fetchSocketsMock,
            inMock: vi.fn(() => ({ fetchSockets: fetchSocketsMock })),
        };
    }
);

vi.mock("../../socketManager", () => ({
    SocketManager: {
        emitToRoom: emitToRoomMock,
        emitToUser: emitToUserMock,
        get: () => ({ in: inMock }),
    },
}));

import { broadcastSpaceGuestEvent } from "../broadcastSpaceGuestEvent";

const remoteSocket = (spaceId: string | null) => ({
    data: { spaceId },
    emit: vi.fn(),
    disconnect: vi.fn(),
});

describe("broadcastSpaceGuestEvent", () => {
    beforeEach(() => vi.clearAllMocks());

    it("sends a request to the host room of its space only", async () => {
        const guest = { id: "g1", spaceId: "space-1", name: "Caio" };

        await broadcastSpaceGuestEvent({ type: "requested", guest } as never);

        expect(emitToRoomMock).toHaveBeenCalledWith(
            "space-hosts:space-1",
            "space:guest-requested",
            { guest }
        );
        expect(emitToUserMock).not.toHaveBeenCalled();
    });

    it("tells the host room that the list of a space changed", async () => {
        await broadcastSpaceGuestEvent({ type: "updated", spaceId: "space-1" });

        expect(emitToRoomMock).toHaveBeenCalledWith(
            "space-hosts:space-1",
            "space:guest-updated",
            { spaceId: "space-1" }
        );
        expect(emitToUserMock).not.toHaveBeenCalled();
    });

    it("sends an answer to the guest alone", async () => {
        const state = { id: "g1", spaceId: "space-1", status: "ADMITTED" };

        await broadcastSpaceGuestEvent({
            type: "status",
            userId: "guest-user",
            state,
        } as never);

        expect(emitToUserMock).toHaveBeenCalledWith(
            "guest-user",
            "space:guest-status",
            state
        );
        expect(emitToRoomMock).not.toHaveBeenCalled();
    });

    it("cuts only the sockets the guest has in that space", async () => {
        const inside = remoteSocket("space-1");
        const otherSpace = remoteSocket("space-2");
        const idle = remoteSocket(null);
        fetchSocketsMock.mockResolvedValue([inside, otherSpace, idle]);

        await broadcastSpaceGuestEvent({
            type: "removed",
            spaceId: "space-1",
            userId: "guest-user",
        });

        expect(inMock).toHaveBeenCalledWith("user:guest-user");
        expect(inside.emit).toHaveBeenCalledWith("space:guest-removed", {
            spaceId: "space-1",
            userId: "guest-user",
        });
        expect(inside.disconnect).toHaveBeenCalledWith(true);
        for (const untouched of [otherSpace, idle]) {
            expect(untouched.emit).not.toHaveBeenCalled();
            expect(untouched.disconnect).not.toHaveBeenCalled();
        }
    });

    it("cuts every tab of the guest in the space", async () => {
        const tabs = [remoteSocket("space-1"), remoteSocket("space-1")];
        fetchSocketsMock.mockResolvedValue(tabs);

        await broadcastSpaceGuestEvent({
            type: "removed",
            spaceId: "space-1",
            userId: "guest-user",
        });

        tabs.forEach((tab) =>
            expect(tab.disconnect).toHaveBeenCalledWith(true)
        );
    });
});
