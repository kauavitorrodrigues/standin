import { beforeEach, describe, expect, it, vi } from "vitest";

const { releaseMock, emitMock } = vi.hoisted(() => ({
    releaseMock: vi.fn(),
    emitMock: vi.fn(),
}));

vi.mock("@standin/core", () => ({
    DeskService: { releaseForMember: releaseMock },
}));
vi.mock("../../socketManager", () => ({
    SocketManager: { emitToRoom: emitMock },
}));

import { MapEvents } from "@standin/contracts";
import { broadcastMemberDesksReleased } from "../broadcastMemberDesksReleased";
import { buildSpaceRoom } from "../../utils/buildSpaceRoom";

describe("broadcastMemberDesksReleased", () => {
    beforeEach(() => vi.clearAllMocks());

    it("tells the room of each space that the desk is free", async () => {
        releaseMock.mockResolvedValue([
            { spaceId: "s1", mapAssetId: "desk-1", userId: "u1" },
            { spaceId: "s2", mapAssetId: "desk-2", userId: "u1" },
        ]);

        await broadcastMemberDesksReleased({ userId: "u1", organizationId: "org-1" });

        expect(releaseMock).toHaveBeenCalledWith("u1", "org-1");
        expect(emitMock).toHaveBeenCalledTimes(2);
        expect(emitMock).toHaveBeenCalledWith(
            buildSpaceRoom("s1"),
            MapEvents.DESK_RELEASED,
            { mapAssetId: "desk-1", userId: "u1" }
        );
    });

    it("says nothing when the person held no desk", async () => {
        releaseMock.mockResolvedValue([]);
        await broadcastMemberDesksReleased({ userId: "u1", organizationId: "org-1" });
        expect(emitMock).not.toHaveBeenCalled();
    });
});
