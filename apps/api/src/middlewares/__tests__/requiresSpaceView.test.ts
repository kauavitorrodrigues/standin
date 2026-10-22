import { beforeEach, describe, expect, it, vi } from "vitest";

const { findRefMock, getAccessMock } = vi.hoisted(() => ({
    findRefMock: vi.fn(),
    getAccessMock: vi.fn(),
}));

vi.mock("@standin/core", () => ({
    SpaceService: { findRefById: findRefMock },
    MapService: { getAccess: getAccessMock },
}));

import {
    RequiresSpaceView,
    RequiresSpaceViewFromQuery,
} from "../requiresSpaceView";

const REF = { id: "space-1", mapId: "map-1", organizationId: "org-1" };

const buildRes = () => {
    const res = { status: vi.fn(), json: vi.fn() };
    res.status.mockReturnValue(res);
    res.json.mockReturnValue(res);
    return res;
};

const run = async (
    guard: typeof RequiresSpaceView,
    req: Record<string, unknown>
) => {
    const res = buildRes();
    const next = vi.fn();
    await guard(req as never, res as never, next);
    return { res, next };
};

describe("RequiresSpaceView", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, "error").mockImplementation(() => {});
        findRefMock.mockResolvedValue(REF);
    });

    it("lets in whoever can view the space and keeps the access", async () => {
        const access = { canView: true, guest: { id: "g1" } };
        getAccessMock.mockResolvedValue(access);
        const req: Record<string, unknown> = {
            user: { id: "u1" },
            params: { spaceId: "space-1" },
        };

        const { next } = await run(RequiresSpaceView, req);

        expect(getAccessMock).toHaveBeenCalledWith({ id: "u1" }, "map-1");
        expect(next).toHaveBeenCalled();
        expect(req.mapAccess).toBe(access);
        expect(req.spaceRef).toEqual(REF);
    });

    it("reports a space the person cannot view as missing", async () => {
        getAccessMock.mockResolvedValue({ canView: false });

        const { res, next } = await run(RequiresSpaceView, {
            user: { id: "u1" },
            params: { spaceId: "space-1" },
        });

        expect(res.status).toHaveBeenCalledWith(404);
        expect(next).not.toHaveBeenCalled();
    });

    it("reads the space from the query for the ICE route", async () => {
        getAccessMock.mockResolvedValue({ canView: true });

        const { next } = await run(RequiresSpaceViewFromQuery, {
            user: { id: "u1" },
            query: { spaceId: "space-1" },
        });

        expect(findRefMock).toHaveBeenCalledWith("space-1");
        expect(next).toHaveBeenCalled();
    });

    it("refuses the ICE route with no space", async () => {
        const { res, next } = await run(RequiresSpaceViewFromQuery, {
            user: { id: "u1" },
            query: {},
        });

        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
        expect(findRefMock).not.toHaveBeenCalled();
    });

    it("answers 403 with no signed in user", async () => {
        const { res, next } = await run(RequiresSpaceView, { params: {} });

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });
});
