import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    closeMembership: vi.fn(),
    findActiveRole: vi.fn(),
    findUserEmail: vi.fn(),
    closeInvitations: vi.fn(),
    releaseDesks: vi.fn(),
    disconnect: vi.fn(),
}));

vi.mock("../repository", () => ({
    OrganizationMemberRepository: {
        closeMembership: mocks.closeMembership,
        findActiveRole: mocks.findActiveRole,
        findUserEmail: mocks.findUserEmail,
        closeInvitationsOfEmail: mocks.closeInvitations,
    },
}));
vi.mock("../../../maps/desks", () => ({
    DeskService: { releaseForMember: mocks.releaseDesks },
}));
vi.mock("../../../integrations", () => ({
    IntegrationService: { disconnectMember: mocks.disconnect },
}));

import { OrganizationMemberNotFoundError } from "@standin/contracts";
import type { Transaction } from "@standin/database";
import { endOrganizationMembership } from "../endMembership";

const tx = "tx" as unknown as Transaction;
const desk = { spaceId: "s1", mapAssetId: "d1", userId: "u1" };

describe("endOrganizationMembership", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.closeMembership.mockResolvedValue(true);
        mocks.findUserEmail.mockResolvedValue("  Person@Example.COM ");
        mocks.releaseDesks.mockResolvedValue([desk]);
    });

    it("frees the desks, closes the invitations and deletes the connections in the same transaction", async () => {
        const result = await endOrganizationMembership(tx, "org-1", "u1");

        expect(result).toEqual({ role: "MEMBER", freedDesks: [desk] });
        expect(mocks.releaseDesks).toHaveBeenCalledWith("u1", "org-1", tx);
        expect(mocks.disconnect).toHaveBeenCalledWith(
            { organizationId: "org-1", userId: "u1" },
            tx
        );
        expect(mocks.closeInvitations).toHaveBeenCalledWith(
            tx,
            "org-1",
            "person@example.com",
            expect.any(Date)
        );
    });

    it("changes nothing for the owner", async () => {
        mocks.closeMembership.mockResolvedValue(false);
        mocks.findActiveRole.mockResolvedValue("OWNER");

        const result = await endOrganizationMembership(tx, "org-1", "o1");

        expect(result).toEqual({ role: "OWNER", freedDesks: [] });
        expect(mocks.releaseDesks).not.toHaveBeenCalled();
        expect(mocks.disconnect).not.toHaveBeenCalled();
        expect(mocks.closeInvitations).not.toHaveBeenCalled();
    });

    it("throws when the person is not a member", async () => {
        mocks.closeMembership.mockResolvedValue(false);
        mocks.findActiveRole.mockResolvedValue(null);

        await expect(
            endOrganizationMembership(tx, "org-1", "u9")
        ).rejects.toBeInstanceOf(OrganizationMemberNotFoundError);
    });
});
