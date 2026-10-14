import { describe, expect, it } from "vitest";
import type { MapLayout, PlacedAsset } from "@standin/contracts";
import { diffPlaced } from "@/features/maps/__shared__/utils/diffPlaced";
import { getAssetTextureSource } from "@/features/maps/__shared__/utils/getAssetTextureSource";
import { getMissingTilesetSources } from "@/features/maps/__shared__/utils/getMissingTilesetSources";
import { planTileDiff } from "@/features/maps/__shared__/utils/planTileDiff";

const placed = (
    id: string,
    overrides: Partial<PlacedAsset> = {}
): PlacedAsset => ({
    id,
    assetId: "a1",
    tileX: 1,
    tileY: 1,
    parentId: null,
    propertyOverrides: null,
    ...overrides,
});

describe("diffPlaced", () => {
    it("is empty when nothing changed", () => {
        const list = [placed("p1"), placed("p2")];

        expect(diffPlaced(list, structuredClone(list))).toEqual({
            added: [],
            moved: [],
            replaced: [],
            removed: [],
        });
    });

    it("separates added, moved, replaced and removed", () => {
        const previous = [
            placed("p1"),
            placed("p2"),
            placed("p3"),
            placed("p4"),
        ];
        const next = [
            placed("p1", { tileX: 5 }),
            placed("p2", { assetId: "a2" }),
            placed("p3"),
            placed("p5"),
        ];

        const diff = diffPlaced(previous, next);

        expect(diff.moved.map((item) => item.id)).toEqual(["p1"]);
        expect(diff.replaced.map((item) => item.id)).toEqual(["p2"]);
        expect(diff.added.map((item) => item.id)).toEqual(["p5"]);
        expect(diff.removed).toEqual(["p4"]);
    });

    it("counts a change of asset and cell as replaced only", () => {
        const diff = diffPlaced(
            [placed("p1")],
            [placed("p1", { assetId: "a2", tileX: 9 })]
        );

        expect(diff.replaced).toHaveLength(1);
        expect(diff.moved).toHaveLength(0);
    });

    it("treats a new parent as a move and ignores property overrides", () => {
        const diff = diffPlaced(
            [placed("p1"), placed("p2")],
            [
                placed("p1", { parentId: "p9" }),
                placed("p2", { propertyOverrides: { color: "red" } }),
            ]
        );

        expect(diff.moved.map((item) => item.id)).toEqual(["p1"]);
        expect(diff.replaced).toHaveLength(0);
    });
});

describe("getAssetTextureSource", () => {
    const base = {
        id: "abc",
        url: "https://cdn/x.png",
        sprite: { w: 32, h: 64 },
    };

    it("uses the asset-tex key and a plain image when static", () => {
        expect(getAssetTextureSource({ ...base, animation: null })).toEqual({
            key: "asset-tex:abc",
            url: "https://cdn/x.png",
            frame: null,
        });
    });

    it("asks for sprite sized frames when animated", () => {
        const source = getAssetTextureSource({
            ...base,
            animation: { frameCount: 4, frameDurationMs: 100, repeat: -1 },
        });

        expect(source.frame).toEqual({ width: 32, height: 64 });
    });
});

describe("planTileDiff", () => {
    it("groups by layer, putting new tiles and removing emptied cells", () => {
        const plan = planTileDiff([
            { layer: "ground", x: 1, y: 2, before: 0, after: 7 },
            { layer: "ground", x: 2, y: 2, before: 7, after: 0 },
            { layer: "walls", x: 0, y: 0, before: 3, after: 4 },
        ]);

        expect(plan).toEqual([
            {
                layer: "ground",
                puts: [{ x: 1, y: 2, gid: 7 }],
                removes: [{ x: 2, y: 2 }],
            },
            { layer: "walls", puts: [{ x: 0, y: 0, gid: 4 }], removes: [] },
        ]);
    });

    it("is empty for an empty diff", () => {
        expect(planTileDiff([])).toEqual([]);
    });
});

describe("getMissingTilesetSources", () => {
    const declared: MapLayout["tilesets"] = [
        { name: "t1", firstgid: 1 },
        { name: "t2", firstgid: 101 },
        { name: "t3", firstgid: 201 },
    ];
    const library = [
        { id: "t2", url: "u2", margin: 1, spacing: 2 },
        { id: "t1", url: "u1", margin: 0, spacing: 0 },
    ];

    it("returns only the unknown tilesets that the library has", () => {
        expect(
            getMissingTilesetSources(declared, new Set(["t1"]), library)
        ).toEqual([
            { name: "t2", firstgid: 101, url: "u2", margin: 1, spacing: 2 },
        ]);
    });
});
