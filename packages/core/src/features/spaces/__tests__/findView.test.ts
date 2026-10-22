import { beforeEach, describe, expect, it, vi } from "vitest";

const { spaceMock, membershipMock, admittedMock, mapMock, conversationMock } =
    vi.hoisted(() => ({
        spaceMock: vi.fn(),
        membershipMock: vi.fn(),
        admittedMock: vi.fn(),
        mapMock: vi.fn(),
        conversationMock: vi.fn(),
    }));

vi.mock("@standin/database", () => ({
    spacesTable: {},
    and: vi.fn(),
    eq: vi.fn(),
    isNull: vi.fn(),
    db: { select: () => ({ from: () => ({ where: spaceMock }) }) },
}));
vi.mock("../../maps", () => ({
    MapService: { findResolvedById: mapMock },
}));
vi.mock("../../conversations", () => ({
    ConversationService: { findBySpaceId: conversationMock },
}));
vi.mock("../../organizations/findMembership", () => ({
    findOrganizationMembership: membershipMock,
}));
vi.mock("../guests/findAdmitted", () => ({
    findAdmittedSpaceGuest: admittedMock,
}));

import { SpaceNotFoundError } from "@standin/contracts";
import { findSpaceView } from "../findView";

const space = {
    id: "s1",
    name: "Party",
    mapId: "m1",
    organizationId: "org-1",
    guestAccess: "ALLOWED",
};

describe("findSpaceView", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        spaceMock.mockResolvedValue([space]);
        membershipMock.mockResolvedValue(null);
        admittedMock.mockResolvedValue(null);
        mapMock.mockResolvedValue({ id: "m1" });
        conversationMock.mockResolvedValue({ id: "c1" });
    });

    it("gives a member the conversation and the owner flag", async () => {
        membershipMock.mockResolvedValue({ role: "OWNER" });

        const view = await findSpaceView("u1", "s1");

        expect(view).toEqual({
            id: "s1",
            name: "Party",
            conversationId: "c1",
            guestAccess: "ALLOWED",
            viewer: { kind: "MEMBER", isOwner: true },
            map: { id: "m1" },
        });
    });

    it("gives a guest the same shape with no conversation", async () => {
        admittedMock.mockResolvedValue({ id: "g1" });

        const view = await findSpaceView("u1", "s1");

        expect(view.viewer).toEqual({ kind: "GUEST", isOwner: false });
        expect(view.conversationId).toBeNull();
        expect(conversationMock).not.toHaveBeenCalled();
        expect(Object.keys(view).sort()).toEqual(
            [
                "guestAccess",
                "id",
                "map",
                "name",
                "viewer",
                "conversationId",
            ].sort()
        );
    });

    it("hides the space from someone who is neither", async () => {
        await expect(findSpaceView("u1", "s1")).rejects.toThrow(
            SpaceNotFoundError
        );
        expect(mapMock).not.toHaveBeenCalled();
    });

    it("says a deleted or unknown space does not exist", async () => {
        spaceMock.mockResolvedValue([]);

        await expect(findSpaceView("u1", "s1")).rejects.toThrow(
            SpaceNotFoundError
        );
        expect(membershipMock).not.toHaveBeenCalled();
    });
});
