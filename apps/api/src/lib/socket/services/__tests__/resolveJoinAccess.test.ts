import { beforeEach, describe, expect, it, vi } from "vitest";

const { findRefMock, findMembershipMock, findAdmittedMock } = vi.hoisted(
    () => ({
        findRefMock: vi.fn(),
        findMembershipMock: vi.fn(),
        findAdmittedMock: vi.fn(),
    })
);

vi.mock("@standin/core", () => ({
    SpaceService: { findRefById: findRefMock },
    OrganizationService: { findMembership: findMembershipMock },
    SpaceGuestService: { findAdmitted: findAdmittedMock },
}));

import { SpaceNotFoundError } from "@standin/contracts";
import { resolveJoinAccess } from "../resolveJoinAccess";

describe("resolveJoinAccess", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        findRefMock.mockResolvedValue({
            id: "space-1",
            organizationId: "org-1",
        });
        findMembershipMock.mockResolvedValue(null);
        findAdmittedMock.mockResolvedValue(null);
    });

    it("reads the organization from the space and nowhere else", async () => {
        await resolveJoinAccess("user-1", "space-1");

        expect(findRefMock).toHaveBeenCalledWith("space-1");
        expect(findMembershipMock).toHaveBeenCalledWith("user-1", "org-1");
    });

    it("makes a member of the organization a host", async () => {
        findMembershipMock.mockResolvedValue({ role: "MEMBER" });

        expect(await resolveJoinAccess("user-1", "space-1")).toEqual({
            isHost: true,
            isOwner: false,
        });
        expect(findAdmittedMock).not.toHaveBeenCalled();
    });

    it("makes the owner of the organization the owner of the space", async () => {
        findMembershipMock.mockResolvedValue({ role: "OWNER" });

        expect(await resolveJoinAccess("user-1", "space-1")).toEqual({
            isHost: true,
            isOwner: true,
        });
    });

    it("lets an admitted guest in, as neither host nor owner", async () => {
        findAdmittedMock.mockResolvedValue({ id: "g1" });

        expect(await resolveJoinAccess("user-1", "space-1")).toEqual({
            isHost: false,
            isOwner: false,
        });
        expect(findAdmittedMock).toHaveBeenCalledWith("user-1", "space-1");
    });

    it("keeps out a pending guest or a stranger", async () => {
        expect(await resolveJoinAccess("user-1", "space-1")).toBeNull();
    });

    it("keeps out a space that does not exist", async () => {
        findRefMock.mockRejectedValue(new SpaceNotFoundError());

        expect(await resolveJoinAccess("user-1", "space-1")).toBeNull();
        expect(findMembershipMock).not.toHaveBeenCalled();
    });

    it("rethrows unexpected errors", async () => {
        findRefMock.mockRejectedValue(new Error("db down"));

        await expect(resolveJoinAccess("user-1", "space-1")).rejects.toThrow(
            "db down"
        );
    });
});
