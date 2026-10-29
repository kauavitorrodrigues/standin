import { LibrarySeedReferenceNotFoundError } from "@standin/contracts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SeedStamp } from "../../types";

const mocks = vi.hoisted(() => ({
    findTilesetIdsByKeys: vi.fn(),
    findAssetIdsByKeys: vi.fn(),
}));

vi.mock("../../repository", () => ({
    SeedRepository: {
        findTilesetIdsByKeys: mocks.findTilesetIdsByKeys,
        findAssetIdsByKeys: mocks.findAssetIdsByKeys,
    },
}));

import { resolveStamp } from "../resolveStamp";

const stamp: SeedStamp = {
    version: 1,
    width: 2,
    height: 2,
    palette: [
        { tilesetKey: "floor", tileIndex: 0 },
        { tilesetKey: "grass", tileIndex: 1 },
    ],
    layers: { ground: [1, 2, 1, 2] },
    objects: [
        {
            assetKey: "table",
            dx: 0,
            dy: 0,
            offsetX: 0,
            offsetY: 0,
            parentIndex: null,
        },
    ],
    zone: null,
};

beforeEach(() => vi.clearAllMocks());

describe("resolveStamp", () => {
    it("asks for the keys of the stamp and replaces them with ids", async () => {
        mocks.findTilesetIdsByKeys.mockResolvedValue(
            new Map([
                ["floor", "t-1"],
                ["grass", "t-2"],
            ])
        );
        mocks.findAssetIdsByKeys.mockResolvedValue(new Map([["table", "a-1"]]));

        const resolved = await resolveStamp('areas "lobby"', stamp);

        expect(mocks.findTilesetIdsByKeys).toHaveBeenCalledWith([
            "floor",
            "grass",
        ]);
        expect(mocks.findAssetIdsByKeys).toHaveBeenCalledWith(["table"]);
        expect(resolved.palette).toEqual([
            { tilesetId: "t-1", tileIndex: 0 },
            { tilesetId: "t-2", tileIndex: 1 },
        ]);
        expect(resolved.objects[0]).toMatchObject({ assetId: "a-1", dx: 0 });
        expect(resolved.layers).toEqual(stamp.layers);
    });

    it("reports every unknown key at once, with the entry", async () => {
        mocks.findTilesetIdsByKeys.mockResolvedValue(
            new Map([["floor", "t-1"]])
        );
        mocks.findAssetIdsByKeys.mockResolvedValue(new Map());

        const error = await resolveStamp('areas "lobby"', stamp).catch(
            (caught) => caught
        );

        expect(error).toBeInstanceOf(LibrarySeedReferenceNotFoundError);
        expect(error.entry).toBe('areas "lobby"');
        expect(error.references).toEqual([
            { field: "stamp.palette[1].tilesetKey", key: "grass" },
            { field: "stamp.objects[0].assetKey", key: "table" },
        ]);
    });
});
