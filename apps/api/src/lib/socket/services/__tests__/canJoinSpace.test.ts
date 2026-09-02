import { beforeEach, describe, expect, it, vi } from "vitest";

const { findMembershipMock, findByIdMock } = vi.hoisted(() => ({
    findMembershipMock: vi.fn(),
    findByIdMock: vi.fn(),
}));

vi.mock("@standin/core", () => ({
    OrganizationService: { findMembership: findMembershipMock },
    SpaceService: { findById: findByIdMock },
}));

import { SpaceNotFoundError } from "@standin/contracts";
import { canJoinSpace } from "../canJoinSpace";

describe("canJoinSpace", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns false when the user is not a member of the organization", async () => {
        findMembershipMock.mockResolvedValue(null);

        const allowed = await canJoinSpace("user-1", "org-1", "space-1");

        expect(allowed).toBe(false);
        expect(findByIdMock).not.toHaveBeenCalled();
    });

    it("returns false when the space does not exist in that organization", async () => {
        findMembershipMock.mockResolvedValue({ id: "membership-1" });
        findByIdMock.mockRejectedValue(new SpaceNotFoundError());

        const allowed = await canJoinSpace("user-1", "org-1", "space-1");

        expect(allowed).toBe(false);
    });

    it("returns true when the user is a member and the space exists", async () => {
        findMembershipMock.mockResolvedValue({ id: "membership-1" });
        findByIdMock.mockResolvedValue({ id: "space-1" });

        const allowed = await canJoinSpace("user-1", "org-1", "space-1");

        expect(allowed).toBe(true);
    });

    it("rethrows unexpected errors", async () => {
        findMembershipMock.mockResolvedValue({ id: "membership-1" });
        findByIdMock.mockRejectedValue(new Error("db down"));

        await expect(canJoinSpace("user-1", "org-1", "space-1")).rejects.toThrow(
            "db down"
        );
    });
});
