import { beforeEach, describe, expect, it, vi } from "vitest";

const { findOwnerIdsMock, emitToUserMock } = vi.hoisted(() => ({
    findOwnerIdsMock: vi.fn(),
    emitToUserMock: vi.fn(),
}));

vi.mock("@standin/core", () => ({
    OrganizationMemberService: { findOwnerIds: findOwnerIdsMock },
}));
vi.mock("../socketManager", () => ({
    SocketManager: { emitToUser: emitToUserMock },
}));

import { broadcastOrganizationMembersChanged } from "../services/broadcastOrganizationMembersChanged";

describe("broadcastOrganizationMembersChanged", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("tells each owner of the organization and nobody else", async () => {
        findOwnerIdsMock.mockResolvedValue(["owner-1", "owner-2"]);

        await broadcastOrganizationMembersChanged({ organizationId: "org-1" });

        expect(findOwnerIdsMock).toHaveBeenCalledWith("org-1");
        expect(emitToUserMock).toHaveBeenCalledTimes(2);
        expect(emitToUserMock).toHaveBeenCalledWith(
            "owner-1",
            "organization:members-changed",
            { organizationId: "org-1" }
        );
        expect(emitToUserMock).toHaveBeenCalledWith(
            "owner-2",
            "organization:members-changed",
            { organizationId: "org-1" }
        );
    });

    it("sends nothing when the organization has no owner", async () => {
        findOwnerIdsMock.mockResolvedValue([]);

        await broadcastOrganizationMembersChanged({ organizationId: "org-1" });

        expect(emitToUserMock).not.toHaveBeenCalled();
    });
});
