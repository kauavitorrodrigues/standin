import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    apply: vi.fn(),
    emitPublished: vi.fn(),
    emitMapEvent: vi.fn(),
}));

vi.mock("@standin/core", () => ({ MapApplyService: { apply: mocks.apply } }));
vi.mock("@/features/maps/utils/emitPublished", () => ({
    emitPublished: mocks.emitPublished,
}));
vi.mock("@/lib/socket/utils/emitMapEvent", () => ({
    emitMapEvent: mocks.emitMapEvent,
}));

import {
    MAX_PUBLISH_OPS,
    MapLockedError,
    PublishValidationError,
    StaleLayoutVersionError,
} from "@standin/contracts";
import { applyMap } from "../apply";

const buildRes = () => {
    const res: any = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
};

const user = { id: "u1", name: "Ana" };
const mapAccess = { mapId: "m1", canEdit: true };
const ops = [{ type: "set_background", color: "#123456" }];
const result = {
    version: 2,
    idMap: {},
    limits: { objectsUsed: 0, objectsMax: 10 },
};
const send = (body: unknown, res = buildRes()) =>
    applyMap({ user, mapAccess, body } as any, res).then(() => res);

describe("applyMap controller", () => {
    beforeEach(() => vi.resetAllMocks());

    it("applies, answers the publish result and emits after the commit", async () => {
        const desk = { mapAssetId: "a1", userId: "u2" };
        mocks.apply.mockResolvedValue({
            validated: false,
            result,
            releasedDesks: [desk],
        });

        const res = await send({ baseVersion: 1, ops });

        expect(mocks.apply).toHaveBeenCalledWith(user, mapAccess, {
            baseVersion: 1,
            ops,
            validateOnly: false,
        });
        expect(mocks.emitPublished).toHaveBeenCalledWith(
            mapAccess,
            "map",
            result
        );
        expect(mocks.emitMapEvent).toHaveBeenCalledWith(
            mapAccess,
            "desk_released",
            desk
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(result);
    });

    it("answers valid for a dry run and emits nothing", async () => {
        mocks.apply.mockResolvedValue({ validated: true });

        const res = await send({ baseVersion: 1, ops, validateOnly: true });

        expect(res.json).toHaveBeenCalledWith({ valid: true });
        expect(mocks.emitPublished).not.toHaveBeenCalled();
        expect(mocks.emitMapEvent).not.toHaveBeenCalled();
    });

    it("answers 400 for a body that is not valid and calls nothing", async () => {
        const res = await send({ baseVersion: 0, ops });

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mocks.apply).not.toHaveBeenCalled();
    });

    it("answers 413 for too many ops before the schema", async () => {
        const many = Array.from({ length: MAX_PUBLISH_OPS + 1 }, () => ops[0]);

        const res = await send({ baseVersion: 1, ops: many });

        expect(res.status).toHaveBeenCalledWith(413);
        expect(mocks.apply).not.toHaveBeenCalled();
    });

    it.each([
        ["423", new MapLockedError({ id: "u2", name: "Bia" }, "now"), 423],
        ["409", new StaleLayoutVersionError(3), 409],
        ["422", new PublishValidationError([]), 422],
    ])("answers %s and emits nothing", async (_label, error, status) => {
        mocks.apply.mockRejectedValue(error);

        const res = await send({ baseVersion: 1, ops });

        expect(res.status).toHaveBeenCalledWith(status);
        expect(mocks.emitPublished).not.toHaveBeenCalled();
    });
});
