import { describe, expect, it } from "vitest";
import type { MapRenderPayload } from "@standin/contracts";
import { toEditorMapData } from "@/features/maps/__shared__/utils/toEditorMapData";

const payload = {
    map: {
        id: "map-1",
        width: 20,
        height: 15,
        tileSize: 32,
        layoutVersion: 3,
        layout: {
            width: 20,
            height: 15,
            tilesets: [],
            layers: [
                {
                    id: 1,
                    type: "tilelayer",
                    name: "ground",
                    width: 20,
                    height: 15,
                    data: [],
                },
            ],
        },
    },
    tilesets: [{ id: "tileset-1", name: "Floor", url: "/files/floor.png" }],
    assets: [{ id: "asset-1" }],
    placed: [{ id: "placed-1" }],
    desks: [],
    access: { canEdit: true, ownDeskMapAssetId: null },
} as unknown as MapRenderPayload;

describe("toEditorMapData", () => {
    it("copies the map geometry and the layout", () => {
        const map = toEditorMapData(payload);

        expect(map.id).toBe("map-1");
        expect(map.width).toBe(20);
        expect(map.height).toBe(15);
        expect(map.tileSize).toBe(32);
        expect(map.layout).toMatchObject({ width: 20, height: 15 });
    });

    it("adds the floor layer of the areas above the ground when the map has none", () => {
        const layers = (
            toEditorMapData(payload).layout as unknown as {
                layers: { name: string }[];
            }
        ).layers;

        expect(layers.map(({ name }) => name)).toEqual([
            "ground",
            "area-floor",
        ]);
        expect(
            (payload.map.layout as unknown as { layers: unknown[] }).layers
        ).toHaveLength(1);
    });

    it("names each tileset image by the tileset id", () => {
        expect(toEditorMapData(payload).tilesets).toEqual([
            { tilesetName: "tileset-1", url: "/files/floor.png" },
        ]);
    });

    it("carries the assets and the placed objects", () => {
        const map = toEditorMapData(payload);

        expect(map.assets).toBe(payload.assets);
        expect(map.placed).toBe(payload.placed);
    });
});
