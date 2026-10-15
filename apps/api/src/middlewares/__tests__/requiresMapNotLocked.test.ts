import { beforeEach, describe, expect, it, vi } from "vitest";
import { MapTemplateNotFoundError } from "@standin/contracts";

const { getLockMock, findSpaceRefMock, findTemplateMock } = vi.hoisted(() => ({
    getLockMock: vi.fn(),
    findSpaceRefMock: vi.fn(),
    findTemplateMock: vi.fn(),
}));

vi.mock("@standin/core", () => ({
    MapLockService: { get: getLockMock },
    SpaceService: { findRefById: findSpaceRefMock },
    MapTemplateService: { findById: findTemplateMock },
}));

import { MAP_ID_SOURCES } from "@/consts/mapIdSources";
import { RequiresMapNotLocked } from "../requiresMapNotLocked";

const LOCK = {
    mapId: "map-1",
    userId: "user-1",
    userName: "Ana",
    sessionId: "session-a",
    mode: "map",
    acquiredAt: Date.UTC(2026, 0, 1),
    lastHeartbeatAt: Date.UTC(2026, 0, 1),
};

const buildRes = () => {
    const res = { status: vi.fn(), json: vi.fn() };
    res.status.mockReturnValue(res);
    res.json.mockReturnValue(res);
    return res;
};

const buildReq = (
    params: Record<string, string>,
    extra: Record<string, unknown> = {},
    session?: string
) =>
    ({
        params,
        header: (name: string) =>
            name === "x-editor-session" ? session : undefined,
        ...extra,
    }) as never;

const run = async (
    guard: ReturnType<typeof RequiresMapNotLocked>,
    req: never
) => {
    const res = buildRes();
    const next = vi.fn();
    await guard(req, res as never, next);
    return { res, next };
};

describe("RequiresMapNotLocked", () => {
    beforeEach(() => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        getLockMock.mockReset();
        findSpaceRefMock.mockReset();
        findTemplateMock.mockReset();
    });

    it("goes on when the map has no lock", async () => {
        getLockMock.mockReturnValue(undefined);

        const { res, next } = await run(
            RequiresMapNotLocked(MAP_ID_SOURCES.MAP),
            buildReq({ mapId: "map-1" })
        );

        expect(getLockMock).toHaveBeenCalledWith("map-1");
        expect(next).toHaveBeenCalledOnce();
        expect(res.status).not.toHaveBeenCalled();
    });

    it("answers 423 with the holder when someone else holds the lock", async () => {
        getLockMock.mockReturnValue(LOCK);

        const { res, next } = await run(
            RequiresMapNotLocked(MAP_ID_SOURCES.MAP),
            buildReq({ mapId: "map-1" }, { user: { id: "user-2" } })
        );

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(423);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                code: "MAP_LOCKED",
                by: { id: "user-1", name: "Ana" },
                since: "2026-01-01T00:00:00.000Z",
            })
        );
    });

    it("answers 423 to the holder too, from another session", async () => {
        getLockMock.mockReturnValue(LOCK);

        const { res, next } = await run(
            RequiresMapNotLocked(MAP_ID_SOURCES.MAP),
            buildReq(
                { mapId: "map-1" },
                { user: { id: "user-1" } },
                "session-b"
            )
        );

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(423);
    });

    it("answers 423 to the holder session unless the route allows it", async () => {
        getLockMock.mockReturnValue(LOCK);
        const req = buildReq({ mapId: "map-1" }, {}, "session-a");

        const refused = await run(RequiresMapNotLocked(MAP_ID_SOURCES.MAP), req);
        expect(refused.res.status).toHaveBeenCalledWith(423);

        const allowed = await run(
            RequiresMapNotLocked(MAP_ID_SOURCES.MAP, {
                allowHolderSession: true,
            }),
            req
        );
        expect(allowed.next).toHaveBeenCalledOnce();

        const other = await run(
            RequiresMapNotLocked(MAP_ID_SOURCES.MAP, {
                allowHolderSession: true,
            }),
            buildReq({ mapId: "map-1" }, {}, "session-b")
        );
        expect(other.res.status).toHaveBeenCalledWith(423);
    });

    it("resolves the map from the space of the route", async () => {
        findSpaceRefMock.mockResolvedValue({ id: "space-1", mapId: "map-9" });
        getLockMock.mockReturnValue(LOCK);

        const { res } = await run(
            RequiresMapNotLocked(MAP_ID_SOURCES.SPACE),
            buildReq({ spaceId: "space-1" })
        );

        expect(findSpaceRefMock).toHaveBeenCalledWith("space-1");
        expect(getLockMock).toHaveBeenCalledWith("map-9");
        expect(res.status).toHaveBeenCalledWith(423);
    });

    it("reuses the map already resolved by the space guard", async () => {
        getLockMock.mockReturnValue(undefined);

        const { next } = await run(
            RequiresMapNotLocked(MAP_ID_SOURCES.SPACE),
            buildReq({ spaceId: "space-1" }, { mapAccess: { mapId: "map-7" } })
        );

        expect(findSpaceRefMock).not.toHaveBeenCalled();
        expect(getLockMock).toHaveBeenCalledWith("map-7");
        expect(next).toHaveBeenCalledOnce();
    });

    it("resolves the map from the template of the route", async () => {
        findTemplateMock.mockResolvedValue({ id: "tpl-1", mapId: "map-5" });
        getLockMock.mockReturnValue(LOCK);

        const { res } = await run(
            RequiresMapNotLocked(MAP_ID_SOURCES.TEMPLATE),
            buildReq({ templateId: "tpl-1" })
        );

        expect(findTemplateMock).toHaveBeenCalledWith("tpl-1");
        expect(getLockMock).toHaveBeenCalledWith("map-5");
        expect(res.status).toHaveBeenCalledWith(423);
    });

    it("answers with the not found error when the template is gone", async () => {
        findTemplateMock.mockRejectedValue(new MapTemplateNotFoundError());

        const { res, next } = await run(
            RequiresMapNotLocked(MAP_ID_SOURCES.TEMPLATE),
            buildReq({ templateId: "tpl-x" })
        );

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it("lets a desk route through while a decorator is open", async () => {
        getLockMock.mockReturnValue({ ...LOCK, mode: "objects" });
        const guard = RequiresMapNotLocked(MAP_ID_SOURCES.MAP, {
            allowObjectsMode: true,
        });

        const { res, next } = await run(guard, buildReq({ mapId: "map-1" }));

        expect(next).toHaveBeenCalledOnce();
        expect(res.status).not.toHaveBeenCalled();
    });

    it("still refuses a route without the option while a decorator is open", async () => {
        getLockMock.mockReturnValue({ ...LOCK, mode: "objects" });

        const { res, next } = await run(
            RequiresMapNotLocked(MAP_ID_SOURCES.MAP),
            buildReq({ mapId: "map-1" })
        );

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(423);
    });

    it("refuses a desk route while the Studio is open", async () => {
        getLockMock.mockReturnValue(LOCK);

        const { res, next } = await run(
            RequiresMapNotLocked(MAP_ID_SOURCES.MAP, {
                allowObjectsMode: true,
            }),
            buildReq({ mapId: "map-1" })
        );

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(423);
    });
});
