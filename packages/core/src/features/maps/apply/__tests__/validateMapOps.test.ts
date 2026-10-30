import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    PublishValidationError,
    StaleLayoutVersionError,
} from "@standin/contracts";
import type { PublishRequest } from "@standin/contracts";

const mocks = vi.hoisted(() => ({
    transaction: vi.fn(),
    replay: vi.fn(),
}));
const tx = { insert: vi.fn(), update: vi.fn(), delete: vi.fn() };

vi.mock("@standin/database", () => ({
    db: { transaction: mocks.transaction },
}));
vi.mock("../../publish/utils/replayPublishRequest", () => ({
    replayPublishRequest: mocks.replay,
}));

import type { MapAccess } from "../../types/map-access";
import { validateMapOps } from "../validateMapOps";

const access = { mapId: "map-1", canEdit: true } as MapAccess;
const request: PublishRequest = {
    publishId: "p",
    baseVersion: 1,
    ops: [{ type: "set_background", color: "#123456" }],
};

beforeEach(() => {
    vi.resetAllMocks();
    mocks.transaction.mockImplementation((work) => work(tx));
    mocks.replay.mockResolvedValue({ base: {}, model: {} });
});

describe("validateMapOps", () => {
    it("replays on the open transaction in the map scope and writes nothing", async () => {
        await validateMapOps({ id: "u1" }, access, request);

        expect(mocks.replay).toHaveBeenCalledWith(
            tx,
            { id: "u1" },
            access,
            { kind: "map" },
            request,
            "share"
        );
        expect(tx.insert).not.toHaveBeenCalled();
        expect(tx.update).not.toHaveBeenCalled();
        expect(tx.delete).not.toHaveBeenCalled();
    });

    it.each([
        ["validation", new PublishValidationError([])],
        ["stale version", new StaleLayoutVersionError(2)],
    ])("passes a %s failure on", async (_label, error) => {
        mocks.replay.mockRejectedValue(error);

        await expect(
            validateMapOps({ id: "u1" }, access, request)
        ).rejects.toBe(error);
    });
});
