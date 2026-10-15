import { describe, expect, it } from "vitest";
import { buildEditorModel } from "../buildEditorModel";
import { MAX_OBJECTS_PER_MAP } from "../../../consts/constants";
import { buildLayout } from "../../../layout/__tests__/fixtures";
import type { MapRenderPayload } from "../../../render/render-payload.schema";
import type { LibraryPalette } from "../../../../assets/types/library";

const palette: LibraryPalette = { tilesets: [], assets: [], categories: [] };

const buildRender = (): MapRenderPayload => ({
    map: {
        id: "map-1",
        width: 20,
        height: 15,
        tileSize: 32,
        layoutVersion: 4,
        layout: buildLayout() as unknown as Record<string, unknown>,
    },
    tilesets: [],
    assets: [],
    placed: [
        {
            id: "p1",
            assetId: "a1",
            tileX: 1,
            tileY: 2,
            offsetX: 0,
            offsetY: 0,
            parentId: null,
            propertyOverrides: null,
        },
        {
            id: "p2",
            assetId: "a2",
            tileX: 3,
            tileY: 4,
            offsetX: 0,
            offsetY: 0,
            parentId: "p1",
            propertyOverrides: { color: "red" },
        },
    ],
    desks: [{ mapAssetId: "p1", userId: "u1" }],
    access: { canEdit: true, ownDeskMapAssetId: null },
    limits: { objectsUsed: 2, objectsMax: MAX_OBJECTS_PER_MAP },
    lock: { locked: false },
});

describe("buildEditorModel", () => {
    it("builds the model from the render payload and the palette", () => {
        const render = buildRender();
        const model = buildEditorModel(render, palette);

        expect(model.mapId).toBe("map-1");
        expect(model.width).toBe(20);
        expect(model.height).toBe(15);
        expect(model.version).toBe(4);
        expect(model.library).toBe(palette);
        expect(model.layout).toEqual(render.map.layout);
        expect(model.placed).toEqual(render.placed);
        expect(model.desks).toEqual(render.desks);
    });

    it("takes the limits from the render payload", () => {
        const render = buildRender();
        render.limits = { objectsUsed: 7, objectsMax: 10 };
        const model = buildEditorModel(render, palette);

        expect(model.limits).toEqual({ objectsUsed: 7, objectsMax: 10 });
        expect(model.limits).not.toBe(render.limits);
    });

    it("does not share references with the input", () => {
        const render = buildRender();
        const model = buildEditorModel(render, palette);

        expect(model.layout).not.toBe(render.map.layout);
        expect(model.layout.layers).not.toBe(
            (render.map.layout as { layers: unknown }).layers
        );
        expect(model.placed).not.toBe(render.placed);
        expect(model.placed[1]).not.toBe(render.placed[1]);
        expect(model.desks).not.toBe(render.desks);
        expect(model.desks[0]).not.toBe(render.desks[0]);

        model.placed[0].tileX = 99;
        model.layout.tilesets.push({ name: "x", firstgid: 1 });
        expect(render.placed[0].tileX).toBe(1);
        expect(
            (render.map.layout as { tilesets: unknown[] }).tilesets
        ).toHaveLength(2);
    });
});
