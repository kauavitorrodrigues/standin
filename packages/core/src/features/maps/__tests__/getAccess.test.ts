import { beforeEach, describe, expect, it, vi } from "vitest";

const { ownerMock, membershipMock, admittedMock } = vi.hoisted(() => ({
    ownerMock: vi.fn(),
    membershipMock: vi.fn(),
    admittedMock: vi.fn(),
}));

vi.mock("../findOwner", () => ({ findMapOwner: ownerMock }));
vi.mock("../../organizations", () => ({
    OrganizationService: { findMembership: membershipMock },
}));
vi.mock("../../spaces/guests/findAdmitted", () => ({
    findAdmittedSpaceGuest: admittedMock,
}));

import { getMapAccess } from "../getAccess";

const spaceOwner = {
    kind: "space",
    spaceId: "space-1",
    organizationId: "org-1",
};
const user = { id: "u1", role: "USER" } as never;

describe("getMapAccess for a space map", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        ownerMock.mockResolvedValue(spaceOwner);
        membershipMock.mockResolvedValue(null);
        admittedMock.mockResolvedValue(null);
    });

    it("lets the owner of the organization read, edit and decorate", async () => {
        membershipMock.mockResolvedValue({ role: "OWNER" });

        const access = await getMapAccess(user, "map-1");

        expect(access).toMatchObject({
            canRead: true,
            canEdit: true,
            canDecorate: true,
            canView: true,
            guest: null,
        });
        expect(admittedMock).not.toHaveBeenCalled();
    });

    it("lets a member read and decorate, not edit", async () => {
        membershipMock.mockResolvedValue({ role: "MEMBER" });

        expect(await getMapAccess(user, "map-1")).toMatchObject({
            canRead: true,
            canEdit: false,
            canDecorate: true,
            canView: true,
        });
    });

    it("lets an admitted guest only view", async () => {
        const guest = { id: "g1", spaceId: "space-1", userId: "u1" };
        admittedMock.mockResolvedValue(guest);

        const access = await getMapAccess(user, "map-1");

        expect(admittedMock).toHaveBeenCalledWith("u1", "space-1");
        expect(access).toMatchObject({
            canRead: false,
            canEdit: false,
            canDecorate: false,
            canView: true,
            guest,
            membership: null,
        });
    });

    it("gives a stranger, or a pending guest, nothing", async () => {
        expect(await getMapAccess(user, "map-1")).toMatchObject({
            canRead: false,
            canEdit: false,
            canDecorate: false,
            canView: false,
            guest: null,
        });
    });

    it("a member who is also a guest of another space keeps both apart", async () => {
        membershipMock.mockResolvedValue({ role: "MEMBER" });
        admittedMock.mockResolvedValue({ id: "g1" });

        const access = await getMapAccess(user, "map-1");

        // The membership of this space's organization decides, the pass does
        // not mix in.
        expect(access.guest).toBeNull();
        expect(access.canRead).toBe(true);
    });
});

describe("getMapAccess for a template map", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        ownerMock.mockResolvedValue({
            kind: "template",
            templateId: "t1",
            organizationId: null,
        });
    });

    it("lets only the admin in, and never looks for a guest", async () => {
        const admin = await getMapAccess(
            { id: "a", role: "ADMIN" } as never,
            "m"
        );
        const other = await getMapAccess(user, "m");

        expect(admin).toMatchObject({
            canRead: true,
            canEdit: true,
            canView: true,
        });
        expect(other).toMatchObject({ canRead: false, canView: false });
        expect(admittedMock).not.toHaveBeenCalled();
    });
});
