import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    select: vi.fn(),
    rows: [] as unknown[],
}));

vi.mock("@standin/database", () => {
    const chain = () => {
        const query = {
            from: () => query,
            innerJoin: () => query,
            where: async () => mocks.rows,
        };
        return query;
    };
    return {
        db: {
            select: (...args: unknown[]) => {
                mocks.select(...args);
                return chain();
            },
        },
        assetPartsTable: {},
        areasTable: {},
        avatarBasesTable: {},
        avatarPartsTable: {},
        isNull: vi.fn(),
        assetsTable: { id: "id", key: "key" },
        tilesetsTable: { id: "id", key: "key" },
        filesTable: { id: "id", fileName: "fileName" },
        and: vi.fn(),
        eq: vi.fn(),
        inArray: vi.fn(),
    };
});
vi.mock("../../../utils/loadRows", () => ({
    loadAssetRows: async () => mocks.rows,
}));
vi.mock("../../../../areas/utils/scope", () => ({
    liveAreaInScope: vi.fn(),
}));
vi.mock("../../../utils/scope", () => ({
    liveAssetInScope: vi.fn(),
    liveTilesetInScope: vi.fn(),
}));

import { SeedRepository } from "..";

beforeEach(() => {
    vi.clearAllMocks();
    mocks.rows = [];
});

describe("SeedRepository", () => {
    it("returns an empty map without querying when there are no keys", async () => {
        expect(await SeedRepository.findAssetIdsByKeys([])).toEqual(new Map());
        expect(await SeedRepository.findTilesetIdsByKeys([])).toEqual(
            new Map()
        );
        expect(mocks.select).not.toHaveBeenCalled();
    });

    it("maps the rows to key and id for assets and for tilesets", async () => {
        mocks.rows = [
            { id: "a-1", key: "tree" },
            { id: "a-2", key: "rock" },
        ];
        const expected = new Map([
            ["tree", "a-1"],
            ["rock", "a-2"],
        ]);

        expect(
            await SeedRepository.findAssetIdsByKeys(["tree", "rock"])
        ).toEqual(expected);
        expect(
            await SeedRepository.findTilesetIdsByKeys(["tree", "rock"])
        ).toEqual(expected);
    });

    it("returns the stored file name, or null when the file is missing", async () => {
        mocks.rows = [{ fileName: "abc.png" }];
        expect(await SeedRepository.findStoredFileName("f-1")).toBe("abc.png");

        mocks.rows = [];
        expect(await SeedRepository.findStoredFileName("f-2")).toBeNull();
    });

    it.each([
        "findTilesetByKey",
        "findAssetByKey",
        "findAreaByKey",
        "findAvatarBaseByKey",
        "findAvatarPartByKey",
    ] as const)(
        "%s returns the first row, or null when there is none",
        async (method) => {
            mocks.rows = [{ id: "x-1" }, { id: "x-2" }];
            expect(await SeedRepository[method]("k")).toEqual({ id: "x-1" });

            mocks.rows = [];
            expect(await SeedRepository[method]("k")).toBeNull();
        }
    );

    it("finds a variation by part and color, and the parts of a bundle", async () => {
        mocks.rows = [{ id: "v-1" }];
        expect(await SeedRepository.findAvatarVariation("p", "red")).toEqual({
            id: "v-1",
        });
        expect(await SeedRepository.findBundleParts("a-1")).toEqual([
            { id: "v-1" },
        ]);
    });
});
