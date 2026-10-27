import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchSocketsMock, inMock, orgMock } = vi.hoisted(() => ({
    fetchSocketsMock: vi.fn(),
    inMock: vi.fn(),
    orgMock: vi.fn(),
}));

vi.mock("../../socketManager", () => ({
    SocketManager: { get: () => ({ in: inMock }) },
}));
vi.mock("../resolveSpaceOrganizationId", () => ({
    resolveSpaceOrganizationId: orgMock,
}));

import { SpaceNotFoundError } from "@standin/contracts";
import { broadcastMemberRemoved } from "../broadcastMemberRemoved";
import { JoinAccessCache } from "../joinAccessCache";

const socketIn = (spaceId: string | null) => ({
    data: { spaceId },
    disconnect: vi.fn(),
});

describe("broadcastMemberRemoved", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        JoinAccessCache.clear();
        inMock.mockReturnValue({ fetchSockets: fetchSocketsMock });
        orgMock.mockImplementation(async (spaceId: string) =>
            spaceId === "space-a" ? "org-1" : "org-2"
        );
    });

    it("forgets the access of the person", async () => {
        JoinAccessCache.set("u1", "space-a", { isHost: true, isOwner: false });
        fetchSocketsMock.mockResolvedValue([]);

        await broadcastMemberRemoved({ userId: "u1", organizationId: "org-1" });

        expect(JoinAccessCache.get("u1", "space-a")).toBeUndefined();
    });

    it("puts the person out of the spaces of that organization only", async () => {
        const inside = socketIn("space-a");
        const elsewhere = socketIn("space-b");
        const idle = socketIn(null);
        fetchSocketsMock.mockResolvedValue([inside, elsewhere, idle]);

        await broadcastMemberRemoved({ userId: "u1", organizationId: "org-1" });

        expect(inside.disconnect).toHaveBeenCalledWith(true);
        expect(elsewhere.disconnect).not.toHaveBeenCalled();
        expect(idle.disconnect).not.toHaveBeenCalled();
    });

    it("puts the person out of a space that was deleted with the organization", async () => {
        orgMock.mockRejectedValue(new SpaceNotFoundError());
        const gone = socketIn("space-deleted");
        fetchSocketsMock.mockResolvedValue([gone]);

        await broadcastMemberRemoved({ userId: "u1", organizationId: "org-1" });

        expect(gone.disconnect).toHaveBeenCalledWith(true);
    });
});
