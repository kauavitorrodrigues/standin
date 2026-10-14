import { describe, expect, it } from "vitest";
import type { AssetDefinition } from "../../../../assets/types";
import type { LibraryPalette } from "../../../../assets/types/library";
import {
    WALL_IMAGE_ID,
    buildLayout,
    library,
} from "../../../layout/__tests__/fixtures";
import { LAYOUT_ISSUE_CODES as Code } from "../../../layout/issues";
import { findTileLayer } from "../../../layout/ops/findTileLayer";
import type { PlacedAsset } from "../../../render/render-payload.schema";
import type { EditorModel } from "../../types/editor-model";
import { canPlaceAsset } from "../canPlaceAsset";

const asset = (overrides: Partial<AssetDefinition>): AssetDefinition =>
    ({
        id: "a",
        type: "DECORATION",
        placement: "GROUND",
        footprint: { w: 1, h: 1, offsetX: 0 },
        ...overrides,
    }) as AssetDefinition;

const crate = asset({ id: "crate" });
const bigCrate = asset({ id: "big", footprint: { w: 2, h: 2, offsetX: 0 } });
const desk = asset({
    id: "desk",
    type: "DESK",
    footprint: { w: 3, h: 1, offsetX: 0 },
});
const vase = asset({ id: "vase", type: "PLANT", placement: "SURFACE" });
const poster = asset({ id: "poster", type: "POSTER", placement: "WALL" });
const sofa = asset({
    id: "sofa",
    type: "SOFA",
    footprint: { w: 2, h: 1, offsetX: 0 },
});

const palette = {
    tilesets: Object.values(library.tilesets).map(
        ({ id, tileCount, tileMeta }) => ({ id, tileCount, tileMeta })
    ),
    assets: [crate, bigCrate, desk, vase, poster, sofa],
    categories: [],
    areas: [],
} as unknown as LibraryPalette;

const placedAt = (
    id: string,
    assetId: string,
    tileX: number,
    tileY: number,
    parentId: string | null = null
): PlacedAsset => ({
    id,
    assetId,
    tileX,
    tileY,
    offsetX: 0,
    offsetY: 0,
    parentId,
    propertyOverrides: null,
});

const buildModel = (placed: PlacedAsset[] = []): EditorModel => {
    const layout = buildLayout();
    return {
        mapId: "map-1",
        width: layout.width,
        height: layout.height,
        layout,
        placed,
        library: palette,
        desks: [],
        limits: { objectsUsed: placed.length, objectsMax: 100 },
        version: 1,
    };
};

// Writes a tile of the wall tileset on the walls layer.
const paintWall = (model: EditorModel, x: number, y: number, index: number) => {
    const firstgid = model.layout.tilesets.find(
        ({ name }) => name === WALL_IMAGE_ID
    )!.firstgid;
    findTileLayer(model.layout, "walls")!.data[y * model.width + x] =
        firstgid + index;
};

const clearWalls = (model: EditorModel) => {
    findTileLayer(model.layout, "walls")!.data.fill(0);
};

describe("canPlaceAsset: bounds and limit", () => {
    it("accepts a free GROUND spot", () => {
        const model = buildModel();
        clearWalls(model);
        expect(canPlaceAsset(model, crate, 5, 5)).toEqual({ ok: true });
    });

    it("refuses a footprint outside the map", () => {
        const model = buildModel();
        clearWalls(model);
        const fail = { ok: false, reason: Code.CELL_OUT_OF_BOUNDS };
        expect(canPlaceAsset(model, crate, -1, 5)).toEqual(fail);
        expect(canPlaceAsset(model, crate, 5, model.height)).toEqual(fail);
        expect(canPlaceAsset(model, crate, model.width - 1, 5).ok).toBe(true);
        expect(canPlaceAsset(model, sofa, model.width - 1, 5)).toEqual(fail);
        expect(canPlaceAsset(model, bigCrate, 5, 0)).toEqual(fail);
    });

    it("refuses when the object limit is reached, unless it replaces one", () => {
        const model = buildModel([placedAt("p1", "crate", 5, 5)]);
        clearWalls(model);
        model.limits = { objectsUsed: 1, objectsMax: 1 };
        expect(canPlaceAsset(model, crate, 8, 8)).toEqual({
            ok: false,
            reason: Code.TOO_MANY_OBJECTS,
        });
        expect(canPlaceAsset(model, crate, 8, 8, { ignoreId: "p1" })).toEqual({
            ok: true,
        });
    });
});

describe("canPlaceAsset: GROUND", () => {
    it("refuses an overlap with another GROUND object", () => {
        const model = buildModel([placedAt("p1", "desk", 5, 5)]);
        clearWalls(model);
        expect(canPlaceAsset(model, crate, 6, 5)).toEqual({
            ok: false,
            reason: Code.FOOTPRINT_OVERLAP,
        });
        expect(canPlaceAsset(model, bigCrate, 7, 6)).toEqual({
            ok: false,
            reason: Code.FOOTPRINT_OVERLAP,
        });
        expect(canPlaceAsset(model, crate, 8, 5).ok).toBe(true);
        expect(canPlaceAsset(model, crate, 5, 6).ok).toBe(true);
    });

    it("does not overlap with a SURFACE item", () => {
        const model = buildModel([
            placedAt("d", "desk", 5, 5),
            placedAt("v", "vase", 5, 5, "d"),
        ]);
        clearWalls(model);
        expect(canPlaceAsset(model, crate, 5, 5)).toEqual({
            ok: false,
            reason: Code.FOOTPRINT_OVERLAP,
        });
        expect(canPlaceAsset(model, crate, 5, 5, { ignoreId: "d" }).ok).toBe(
            true
        );
    });

    it("lets an object move to where it already was", () => {
        const model = buildModel([placedAt("p1", "desk", 5, 5)]);
        clearWalls(model);
        expect(canPlaceAsset(model, desk, 5, 5).ok).toBe(false);
        expect(canPlaceAsset(model, desk, 5, 5, { ignoreId: "p1" })).toEqual({
            ok: true,
        });
        expect(canPlaceAsset(model, desk, 6, 5, { ignoreId: "p1" })).toEqual({
            ok: true,
        });
    });

    it("refuses a footprint over a solid wall tile", () => {
        const model = buildModel();
        clearWalls(model);
        paintWall(model, 6, 5, 0);
        expect(canPlaceAsset(model, desk, 5, 5)).toEqual({
            ok: false,
            reason: Code.CELL_BLOCKED_BY_WALL,
        });
        expect(canPlaceAsset(model, desk, 7, 5).ok).toBe(true);
    });

    it("ignores a wall layer cell that is not a WALL tile", () => {
        const model = buildModel();
        clearWalls(model);
        paintWall(model, 6, 5, 2);
        expect(canPlaceAsset(model, desk, 5, 5)).toEqual({ ok: true });
    });
});

describe("canPlaceAsset: SURFACE", () => {
    const base = () => {
        const model = buildModel([
            placedAt("d", "desk", 5, 5),
            placedAt("c", "crate", 12, 12),
        ]);
        clearWalls(model);
        return model;
    };

    it("accepts an item on the desk top", () => {
        expect(canPlaceAsset(base(), vase, 6, 5, { parentId: "d" })).toEqual({
            ok: true,
        });
    });

    it("refuses without a parent, with an unknown parent or a parent that takes no items", () => {
        const fail = { ok: false, reason: Code.NOT_ON_SURFACE };
        expect(canPlaceAsset(base(), vase, 6, 5)).toEqual(fail);
        expect(canPlaceAsset(base(), vase, 6, 5, { parentId: "x" })).toEqual(
            fail
        );
        expect(canPlaceAsset(base(), vase, 12, 12, { parentId: "c" })).toEqual(
            fail
        );
    });

    it("refuses an item outside the parent footprint", () => {
        expect(canPlaceAsset(base(), vase, 8, 5, { parentId: "d" })).toEqual({
            ok: false,
            reason: Code.NOT_ON_SURFACE,
        });
    });

    it("refuses two items on the same cell and allows the same item to stay", () => {
        const model = base();
        model.placed.push(placedAt("v", "vase", 6, 5, "d"));
        model.limits.objectsUsed += 1;
        expect(canPlaceAsset(model, vase, 6, 5, { parentId: "d" })).toEqual({
            ok: false,
            reason: Code.FOOTPRINT_OVERLAP,
        });
        expect(
            canPlaceAsset(model, vase, 6, 5, { parentId: "d", ignoreId: "v" })
        ).toEqual({ ok: true });
        expect(canPlaceAsset(model, vase, 7, 5, { parentId: "d" }).ok).toBe(
            true
        );
    });
});

describe("canPlaceAsset: WALL", () => {
    it("accepts a footprint over wall tiles", () => {
        const model = buildModel();
        clearWalls(model);
        paintWall(model, 5, 5, 0);
        expect(canPlaceAsset(model, poster, 5, 5)).toEqual({ ok: true });
    });

    it("refuses a footprint that is not entirely over wall tiles", () => {
        const model = buildModel();
        clearWalls(model);
        paintWall(model, 5, 5, 0);
        const fail = { ok: false, reason: Code.NOT_ON_WALL };
        expect(canPlaceAsset(model, poster, 6, 5)).toEqual(fail);
        expect(
            canPlaceAsset(
                model,
                asset({ ...poster, footprint: { w: 2, h: 1, offsetX: 0 } }),
                5,
                5
            )
        ).toEqual(fail);
    });

    it("does not take a decoration tile on the walls layer for a wall", () => {
        const model = buildModel();
        clearWalls(model);
        paintWall(model, 5, 5, 2);
        expect(canPlaceAsset(model, poster, 5, 5)).toEqual({
            ok: false,
            reason: Code.NOT_ON_WALL,
        });
    });
});
