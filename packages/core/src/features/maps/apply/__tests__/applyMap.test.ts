import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    MAX_PUBLISH_OPS,
    MapLockedError,
    PublishForbiddenError,
    PublishTooManyOpsError,
    PublishValidationError,
    StaleLayoutVersionError,
} from "@standin/contracts";
import type { EditorOp } from "@standin/contracts";

const mocks = vi.hoisted(() => ({
    publishMap: vi.fn(),
    validateMapOps: vi.fn(),
}));

vi.mock("../../publish/publishMap", () => ({ publishMap: mocks.publishMap }));
vi.mock("../validateMapOps", () => ({
    validateMapOps: mocks.validateMapOps,
}));

import { MapLockService } from "../../lock";
import type { MapAccess } from "../../types/map-access";
import { applyMap } from "../applyMap";

const MAP_ID = "map-1";
const user = { id: "u1", name: "Ana" };
const access = { mapId: MAP_ID, canEdit: true } as MapAccess;
const ops: EditorOp[] = [{ type: "set_background", color: "#123456" }];
const request = { baseVersion: 1, ops };
const result = {
    version: 2,
    idMap: {},
    limits: { objectsUsed: 0, objectsMax: 10 },
};

beforeEach(() => {
    vi.resetAllMocks();
    const lock = MapLockService.get(MAP_ID);
    if (lock) MapLockService.release(MAP_ID, lock.sessionId);
    mocks.publishMap.mockResolvedValue({ result, releasedDesks: [] });
});

describe("applyMap", () => {
    it("publishes in the map scope with a session of its own and a fresh publish id", async () => {
        const outcome = await applyMap(user, access, request);

        expect(outcome).toEqual({
            validated: false,
            result,
            releasedDesks: [],
        });
        const [actor, passedAccess, sessionId, published] =
            mocks.publishMap.mock.calls[0];
        expect(actor).toBe(user);
        expect(passedAccess).toBe(access);
        expect(sessionId).toMatch(/^apply:/);
        expect(published).toMatchObject({
            scope: "map",
            baseVersion: 1,
            ops,
        });
        expect(typeof published.publishId).toBe("string");
    });

    it("holds the lock in map mode while it publishes and lets it go after", async () => {
        mocks.publishMap.mockImplementation(async (_u, _a, sessionId) => {
            const lock = MapLockService.get(MAP_ID);
            expect(lock).toMatchObject({
                sessionId,
                userId: "u1",
                userName: "Ana",
                mode: "map",
            });
            return { result, releasedDesks: [] };
        });

        await applyMap(user, access, request);

        expect(MapLockService.get(MAP_ID)).toBeUndefined();
    });

    it("lets the lock go when the publish fails", async () => {
        mocks.publishMap.mockRejectedValue(new StaleLayoutVersionError(3));

        await expect(applyMap(user, access, request)).rejects.toBeInstanceOf(
            StaleLayoutVersionError
        );

        expect(MapLockService.get(MAP_ID)).toBeUndefined();
    });

    it("carries the issues of a validation failure", async () => {
        const issues = [{ code: "TILE_OUT_OF_BOUNDS", opIndex: 0 }];
        mocks.publishMap.mockRejectedValue(
            new PublishValidationError(issues as never)
        );

        const error = await applyMap(user, access, request).catch((e) => e);

        expect(error).toBeInstanceOf(PublishValidationError);
        expect(error.errors).toEqual(issues);
        expect(MapLockService.get(MAP_ID)).toBeUndefined();
    });

    it.each([
        ["another person", { id: "u2", name: "Bia" }],
        ["the same person in another session", user],
    ])(
        "is refused with MapLockedError when %s holds the lock",
        async (_l, holder) => {
            MapLockService.acquire(MAP_ID, holder, "editor-1");

            const error = await applyMap(user, access, request).catch((e) => e);

            expect(error).toBeInstanceOf(MapLockedError);
            expect(error.by).toEqual(holder);
            expect(typeof error.since).toBe("string");
            expect(mocks.publishMap).not.toHaveBeenCalled();
            // The editor keeps its lock.
            expect(MapLockService.get(MAP_ID)?.sessionId).toBe("editor-1");
        }
    );

    it("is refused when a decorator holds the lock", async () => {
        MapLockService.acquire(
            MAP_ID,
            { id: "u2", name: "Bia" },
            "d-1",
            "objects"
        );

        await expect(applyMap(user, access, request)).rejects.toBeInstanceOf(
            MapLockedError
        );
        expect(MapLockService.get(MAP_ID)?.sessionId).toBe("d-1");
    });

    it("is forbidden without canEdit and takes no lock", async () => {
        await expect(
            applyMap(user, { ...access, canEdit: false }, request)
        ).rejects.toBeInstanceOf(PublishForbiddenError);

        expect(mocks.publishMap).not.toHaveBeenCalled();
        expect(MapLockService.get(MAP_ID)).toBeUndefined();
    });

    it("refuses too many ops before taking the lock", async () => {
        const many = Array.from({ length: MAX_PUBLISH_OPS + 1 }, () => ops[0]);

        await expect(
            applyMap(user, access, { baseVersion: 1, ops: many })
        ).rejects.toBeInstanceOf(PublishTooManyOpsError);
        expect(MapLockService.get(MAP_ID)).toBeUndefined();
    });

    describe("validateOnly", () => {
        it("validates, writes nothing and takes no lock", async () => {
            mocks.validateMapOps.mockImplementation(async () => {
                expect(MapLockService.get(MAP_ID)).toBeUndefined();
            });

            const outcome = await applyMap(user, access, {
                ...request,
                validateOnly: true,
            });

            expect(outcome).toEqual({ validated: true });
            expect(mocks.publishMap).not.toHaveBeenCalled();
            expect(MapLockService.get(MAP_ID)).toBeUndefined();
        });

        it("still needs canEdit", async () => {
            await expect(
                applyMap(
                    user,
                    { ...access, canEdit: false },
                    {
                        ...request,
                        validateOnly: true,
                    }
                )
            ).rejects.toBeInstanceOf(PublishForbiddenError);
            expect(mocks.validateMapOps).not.toHaveBeenCalled();
        });

        it("passes the failure of the replay on", async () => {
            mocks.validateMapOps.mockRejectedValue(
                new PublishValidationError([])
            );

            await expect(
                applyMap(user, access, { ...request, validateOnly: true })
            ).rejects.toBeInstanceOf(PublishValidationError);
        });

        it("is refused like the real call when an editor holds the lock, and leaves it", async () => {
            MapLockService.acquire(MAP_ID, { id: "u2", name: "Bia" }, "e-1");

            await expect(
                applyMap(user, access, { ...request, validateOnly: true })
            ).rejects.toBeInstanceOf(MapLockedError);

            expect(mocks.validateMapOps).not.toHaveBeenCalled();
            expect(MapLockService.get(MAP_ID)?.sessionId).toBe("e-1");
        });
    });
});
