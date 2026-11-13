import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    endMembership: vi.fn(),
    findMembership: vi.fn(),
    findById: vi.fn(),
    publishRemoved: vi.fn(),
    publishChanged: vi.fn(),
}));

vi.mock("@standin/database", () => ({
    db: { transaction: (work: (tx: unknown) => unknown) => work("tx") },
}));
vi.mock("../endMembership", () => ({
    endOrganizationMembership: mocks.endMembership,
}));
vi.mock("../../findMembership", () => ({
    findOrganizationMembership: mocks.findMembership,
}));
vi.mock("../../findById", () => ({ findOrganizationById: mocks.findById }));
vi.mock("../memberRemovedEvents", () => ({
    publishOrganizationMemberRemoved: mocks.publishRemoved,
}));
vi.mock("../membersChangedEvents", () => ({
    publishOrganizationMembersChanged: mocks.publishChanged,
}));

import {
    OrganizationMemberNotFoundError,
    OrganizationOwnerCannotBeRemovedError,
    OrganizationOwnerCannotLeaveError,
    OrganizationOwnerOnlyError,
} from "@standin/contracts";
import { leaveOrganization } from "../leave";
import { removeOrganizationMember } from "../remove";

describe("removeOrganizationMember", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.findMembership.mockResolvedValue({ role: "OWNER" });
        mocks.findById.mockResolvedValue({ id: "org-1", name: "Acme" });
        mocks.endMembership.mockResolvedValue({
            role: "MEMBER",
            freedDesks: [],
        });
    });

    it("ends the membership in a transaction and publishes the removal with a notice", async () => {
        await removeOrganizationMember("owner", "org-1", "u1");

        expect(mocks.endMembership).toHaveBeenCalledWith("tx", "org-1", "u1");
        expect(mocks.publishRemoved).toHaveBeenCalledWith({
            userId: "u1",
            organizationId: "org-1",
            notice: { organizationName: "Acme", reason: "removed" },
            freedDesks: [],
        });
        expect(mocks.publishChanged).toHaveBeenCalledWith({
            organizationId: "org-1",
        });
    });

    it("refuses anyone who is not the owner, without touching anything", async () => {
        mocks.findMembership.mockResolvedValue({ role: "MEMBER" });
        await expect(
            removeOrganizationMember("peer", "org-1", "u1")
        ).rejects.toBeInstanceOf(OrganizationOwnerOnlyError);

        mocks.findMembership.mockResolvedValue(null);
        await expect(
            removeOrganizationMember("admin", "org-1", "u1")
        ).rejects.toBeInstanceOf(OrganizationOwnerOnlyError);

        expect(mocks.endMembership).not.toHaveBeenCalled();
        expect(mocks.publishRemoved).not.toHaveBeenCalled();
    });

    it("never removes the owner and publishes nothing", async () => {
        mocks.endMembership.mockResolvedValue({
            role: "OWNER",
            freedDesks: [],
        });

        await expect(
            removeOrganizationMember("owner", "org-1", "owner")
        ).rejects.toBeInstanceOf(OrganizationOwnerCannotBeRemovedError);
        expect(mocks.publishRemoved).not.toHaveBeenCalled();
    });

    it("passes on that the person is not a member", async () => {
        mocks.endMembership.mockRejectedValue(
            new OrganizationMemberNotFoundError()
        );

        await expect(
            removeOrganizationMember("owner", "org-1", "u9")
        ).rejects.toBeInstanceOf(OrganizationMemberNotFoundError);
        expect(mocks.publishRemoved).not.toHaveBeenCalled();
    });
});

describe("leaveOrganization", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.findById.mockResolvedValue({ id: "org-1", name: "Acme" });
        mocks.endMembership.mockResolvedValue({
            role: "MEMBER",
            freedDesks: [],
        });
    });

    it("ends the membership and publishes the removal with the reason left", async () => {
        await leaveOrganization("u1", "org-1");

        expect(mocks.endMembership).toHaveBeenCalledWith("tx", "org-1", "u1");
        expect(mocks.publishRemoved).toHaveBeenCalledWith({
            userId: "u1",
            organizationId: "org-1",
            notice: { organizationName: "Acme", reason: "left" },
            freedDesks: [],
        });
    });

    it("does not let the only owner leave", async () => {
        mocks.endMembership.mockResolvedValue({
            role: "OWNER",
            freedDesks: [],
        });

        await expect(
            leaveOrganization("owner", "org-1")
        ).rejects.toBeInstanceOf(OrganizationOwnerCannotLeaveError);
        expect(mocks.publishRemoved).not.toHaveBeenCalled();
    });
});
