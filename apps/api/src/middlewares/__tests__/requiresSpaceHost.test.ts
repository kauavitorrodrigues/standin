import { beforeEach, describe, expect, it, vi } from "vitest";

const { findRefMock, findMembershipMock } = vi.hoisted(() => ({
    findRefMock: vi.fn(),
    findMembershipMock: vi.fn(),
}));

vi.mock("@standin/core", () => ({
    SpaceService: { findRefById: findRefMock },
    OrganizationService: { findMembership: findMembershipMock },
}));

import { SpaceNotFoundError } from "@standin/contracts";
import { RequiresSpaceHost, RequiresSpaceOwner } from "../requiresSpaceHost";

const REF = { id: "space-1", mapId: "map-1", organizationId: "org-1" };

const buildRes = () => {
    const res = { status: vi.fn(), json: vi.fn() };
    res.status.mockReturnValue(res);
    res.json.mockReturnValue(res);
    return res;
};

const run = async (
    guard: typeof RequiresSpaceHost,
    req: Record<string, unknown>
) => {
    const res = buildRes();
    const next = vi.fn();
    await guard(req as never, res as never, next);
    return { res, next };
};

const request = () => ({
    user: { id: "u1" },
    params: { spaceId: "space-1" },
});

describe("space host guards", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, "error").mockImplementation(() => {});
        findRefMock.mockResolvedValue(REF);
        findMembershipMock.mockResolvedValue(null);
    });

    it.each([
        ["host", RequiresSpaceHost],
        ["owner", RequiresSpaceOwner],
    ])(
        "answers 403 to a guest or a stranger on the %s routes",
        async (_, guard) => {
            const { res, next } = await run(guard, request());

            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).not.toHaveBeenCalled();
        }
    );

    it.each([
        ["host", RequiresSpaceHost],
        ["owner", RequiresSpaceOwner],
    ])(
        "answers a space that does not exist like any other 403 on the %s routes",
        async (_, guard) => {
            findRefMock.mockRejectedValue(new SpaceNotFoundError());

            const { res, next } = await run(guard, request());

            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).not.toHaveBeenCalled();
        }
    );

    it("lets an owner and a member on the host routes", async () => {
        for (const role of ["OWNER", "MEMBER"]) {
            findMembershipMock.mockResolvedValue({ role, userId: "u1" });
            const req = request() as Record<string, unknown>;

            const { next } = await run(RequiresSpaceHost, req);

            expect(next).toHaveBeenCalled();
            expect(req.spaceRef).toEqual(REF);
            expect(req.organizationMembership).toMatchObject({ role });
        }
    });

    it("lets only the owner on the owner routes", async () => {
        findMembershipMock.mockResolvedValue({ role: "MEMBER" });
        const asMember = await run(RequiresSpaceOwner, request());
        findMembershipMock.mockResolvedValue({ role: "OWNER" });
        const asOwner = await run(RequiresSpaceOwner, request());

        expect(asMember.res.status).toHaveBeenCalledWith(403);
        expect(asMember.next).not.toHaveBeenCalled();
        expect(asOwner.next).toHaveBeenCalled();
    });

    it("asks for the membership in the organization of the space, not one from the request", async () => {
        findMembershipMock.mockResolvedValue({ role: "OWNER" });
        const req = {
            ...request(),
            params: { spaceId: "space-1", organizationId: "forged" },
        };

        await run(RequiresSpaceHost, req);

        expect(findMembershipMock).toHaveBeenCalledWith("u1", "org-1");
    });

    it("does not hide a real failure behind a 403", async () => {
        findRefMock.mockRejectedValue(new Error("db down"));

        const { res, next } = await run(RequiresSpaceHost, request());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.status).not.toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it("answers 403 with no signed in user", async () => {
        const { res, next } = await run(RequiresSpaceHost, { params: {} });

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });
});
