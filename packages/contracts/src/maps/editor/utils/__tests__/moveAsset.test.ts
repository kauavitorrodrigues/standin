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
import type { EditorOp } from "../../schemas/editorOp.schema";
import { applyEditorOp } from "../applyEditorOp";

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

const move = (
    id: string,
    tileX: number,
    tileY: number,
    parentId?: string | null
): EditorOp => ({ type: "move_asset", id, tileX, tileY, parentId });

const apply = (model: EditorModel, op: EditorOp) => {
    const result = applyEditorOp(model, op);
    if (!result.ok) throw new Error(result.errors[0]?.code);
    return result;
};

const codeOf = (model: EditorModel, op: EditorOp) => {
    const result = applyEditorOp(model, op);
    return result.ok ? null : result.errors.map(({ code }) => code);
};

const clean = (placed: PlacedAsset[] = []) => {
    const model = buildModel(placed);
    clearWalls(model);
    return model;
};

const undo = (model: EditorModel, inverse: EditorOp[]) =>
    inverse.reduce((current, op) => apply(current, op).model, model);

describe("applyEditorOp: move_asset", () => {
    it("moves a chair and undoing returns the original", () => {
        const model = clean([placedAt("c", "crate", 5, 5)]);
        const snapshot = structuredClone(model);
        const result = apply(model, move("c", 9, 9));

        expect(result.model.placed).toEqual([placedAt("c", "crate", 9, 9)]);
        expect(result.inverse).toEqual([
            {
                type: "move_asset",
                id: "c",
                tileX: 5,
                tileY: 5,
                offsetX: 0,
                offsetY: 0,
                parentId: null,
            },
        ]);
        expect(model).toEqual(snapshot);
        expect(undo(result.model, result.inverse)).toEqual(model);
    });

    it("moves a desk with the monitor on top and undoes both", () => {
        const model = clean([
            placedAt("d", "desk", 5, 5),
            placedAt("v", "vase", 6, 5, "d"),
        ]);
        const snapshot = structuredClone(model);
        const result = apply(model, move("d", 8, 10));

        expect(result.model.placed).toEqual([
            placedAt("d", "desk", 8, 10),
            placedAt("v", "vase", 9, 10, "d"),
        ]);
        expect(model).toEqual(snapshot);
        expect(undo(result.model, result.inverse)).toEqual(model);
    });

    it("carries the children by the pixel shift of the parent and undoes it", () => {
        const model = clean([
            placedAt("d", "desk", 5, 5),
            { ...placedAt("v", "vase", 6, 5, "d"), offsetX: 20 },
        ]);
        const result = apply(model, {
            type: "move_asset",
            id: "d",
            tileX: 5,
            tileY: 5,
            offsetX: 15,
            offsetY: 4,
        });

        expect(result.model.placed[0]).toMatchObject({
            offsetX: 15,
            offsetY: 4,
        });
        // 6 * 32 + 20 + 15 = 227 = 7 * 32 + 3.
        expect(result.model.placed[1]).toMatchObject({
            tileX: 7,
            tileY: 5,
            offsetX: 3,
            offsetY: 4,
        });
        expect(undo(result.model, result.inverse)).toEqual(model);
    });

    it("moves a desk next to a GROUND child that overlaps its new footprint", () => {
        const model = clean([
            placedAt("d", "desk", 5, 5),
            placedAt("g", "crate", 5, 6, "d"),
        ]);
        const result = apply(model, move("d", 5, 6));
        expect(result.model.placed).toEqual([
            placedAt("d", "desk", 5, 6),
            placedAt("g", "crate", 5, 7, "d"),
        ]);
    });

    it("refuses an unknown object", () => {
        expect(codeOf(clean(), move("x", 1, 1))).toEqual([
            Code.OBJECT_NOT_FOUND,
        ]);
    });

    it("returns the right code for an occupied, outside or walled target", () => {
        const model = clean([
            placedAt("c", "crate", 5, 5),
            placedAt("o", "crate", 9, 9),
        ]);
        expect(codeOf(model, move("c", 9, 9))).toEqual([
            Code.FOOTPRINT_OVERLAP,
        ]);
        expect(codeOf(model, move("c", -1, 5))).toEqual([
            Code.CELL_OUT_OF_BOUNDS,
        ]);

        const walled = clean([placedAt("c", "crate", 5, 5)]);
        paintWall(walled, 6, 5, 0);
        expect(codeOf(walled, move("c", 6, 5))).toEqual([
            Code.CELL_BLOCKED_BY_WALL,
        ]);
    });

    it("refuses the whole move when a child would land on an occupied cell", () => {
        const model = clean([
            placedAt("d", "desk", 5, 5),
            placedAt("g", "crate", 5, 6, "d"),
            placedAt("o", "crate", 9, 7),
        ]);
        expect(codeOf(model, move("d", 9, 6))).toEqual([
            Code.FOOTPRINT_OVERLAP,
        ]);
    });

    it("changes the parent of a SURFACE item and releases it", () => {
        const model = clean([
            placedAt("d1", "desk", 5, 5),
            placedAt("d2", "desk", 5, 9),
            placedAt("v", "vase", 6, 5, "d1"),
        ]);

        const onOther = apply(model, move("v", 6, 9, "d2"));
        expect(onOther.model.placed[2]).toEqual(
            placedAt("v", "vase", 6, 9, "d2")
        );
        expect(undo(onOther.model, onOther.inverse)).toEqual(model);

        expect(codeOf(model, move("v", 6, 12, null))).toEqual([
            Code.NOT_ON_SURFACE,
        ]);
        expect(codeOf(model, move("v", 6, 9, "d1"))).toEqual([
            Code.NOT_ON_SURFACE,
        ]);
    });

    it("releases a GROUND child moved on its own", () => {
        const model = clean([
            placedAt("d", "desk", 5, 5),
            placedAt("g", "crate", 5, 6, "d"),
        ]);
        const result = apply(model, move("g", 9, 9));
        expect(result.model.placed[1]).toEqual(placedAt("g", "crate", 9, 9));
        expect(undo(result.model, result.inverse)).toEqual(model);
    });

    it("moving onto the same position is valid and the inverse is equal", () => {
        const model = clean([
            placedAt("d", "desk", 5, 5),
            placedAt("v", "vase", 6, 5, "d"),
        ]);
        const result = apply(model, move("d", 5, 5));
        expect(result.model).toEqual(model);
        expect(result.inverse).toEqual([
            {
                type: "move_asset",
                id: "d",
                tileX: 5,
                tileY: 5,
                offsetX: 0,
                offsetY: 0,
                parentId: null,
            },
        ]);
    });

    it("does not mutate the input model on success or failure", () => {
        const model = clean([
            placedAt("d", "desk", 5, 5),
            placedAt("v", "vase", 6, 5, "d"),
        ]);
        const snapshot = structuredClone(model);
        apply(model, move("d", 8, 10));
        codeOf(model, move("d", -5, 5));
        expect(model).toEqual(snapshot);
    });
});

describe("applyEditorOp: move_asset with a pixel offset", () => {
    const moveBy = (
        id: string,
        tileX: number,
        tileY: number,
        offsetX: number,
        offsetY = 0
    ): EditorOp => ({ type: "move_asset", id, tileX, tileY, offsetX, offsetY });

    it("refuses a spot that only overlaps once the offset counts", () => {
        const model = clean([
            placedAt("a", "crate", 5, 5),
            placedAt("b", "crate", 3, 5),
        ]);

        expect(codeOf(model, moveBy("b", 4, 5, 0))).toBeNull();
        expect(codeOf(model, moveBy("b", 4, 5, 16))).toEqual([
            Code.FOOTPRINT_OVERLAP,
        ]);
    });

    it("lets two objects touch by the edge", () => {
        const model = clean([
            placedAt("a", "crate", 5, 5),
            placedAt("b", "crate", 3, 5),
        ]);

        expect(codeOf(model, moveBy("b", 4, 5, 0))).toBeNull();
    });

    it("counts the offset of the object that is already placed", () => {
        const model = clean([
            { ...placedAt("a", "crate", 5, 5), offsetX: -16 },
            placedAt("b", "crate", 3, 5),
        ]);

        expect(codeOf(model, moveBy("b", 4, 5, 0))).toEqual([
            Code.FOOTPRINT_OVERLAP,
        ]);
    });

    it("counts the vertical offset too", () => {
        const model = clean([
            placedAt("a", "crate", 5, 5),
            placedAt("b", "crate", 5, 3),
        ]);

        expect(codeOf(model, moveBy("b", 5, 4, 0, 0))).toBeNull();
        expect(codeOf(model, moveBy("b", 5, 4, 0, 16))).toEqual([
            Code.FOOTPRINT_OVERLAP,
        ]);
    });
});
