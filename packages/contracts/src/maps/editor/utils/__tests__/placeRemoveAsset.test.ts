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

const place = (
    tempId: string,
    assetId: string,
    tileX: number,
    tileY: number,
    parentId?: string
): EditorOp => ({
    type: "place_asset",
    tempId,
    assetId,
    tileX,
    tileY,
    offsetX: 0,
    offsetY: 0,
    parentId,
});

const apply = (model: EditorModel, op: EditorOp) => {
    const result = applyEditorOp(model, op);
    if (!result.ok) throw new Error(result.errors[0]?.code);
    return result;
};

const applyAll = (model: EditorModel, ops: EditorOp[]) =>
    ops.reduce((current, op) => apply(current, op).model, model);

const codeOf = (model: EditorModel, op: EditorOp) => {
    const result = applyEditorOp(model, op);
    return result.ok ? null : result.errors.map(({ code }) => code);
};

const clean = (placed: PlacedAsset[] = []) => {
    const model = buildModel(placed);
    clearWalls(model);
    return model;
};

const sorted = (placed: PlacedAsset[]) =>
    [...placed].sort((a, b) => a.id.localeCompare(b.id));

describe("applyEditorOp: place_asset", () => {
    it("places a chair and undoing returns the original", () => {
        const model = clean();
        const snapshot = structuredClone(model);
        const result = apply(model, place("c1", "crate", 5, 5));

        expect(result.model.placed).toEqual([placedAt("c1", "crate", 5, 5)]);
        expect(result.model.limits.objectsUsed).toBe(1);
        expect(result.inverse).toEqual([{ type: "remove_asset", id: "c1" }]);
        expect(model).toEqual(snapshot);

        const undone = applyAll(result.model, result.inverse);
        expect(undone).toEqual(model);
    });

    it("places a SURFACE item on a desk with parentId", () => {
        const model = clean([placedAt("d", "desk", 5, 5)]);
        const result = apply(model, place("v", "vase", 6, 5, "d"));
        expect(result.model.placed[1]).toEqual(
            placedAt("v", "vase", 6, 5, "d")
        );
    });

    it("returns the right code for each refusal", () => {
        const model = clean([placedAt("d", "desk", 5, 5)]);
        expect(codeOf(model, place("n", "crate", -1, 5))).toEqual([
            Code.CELL_OUT_OF_BOUNDS,
        ]);
        expect(codeOf(model, place("n", "crate", 5, 5))).toEqual([
            Code.FOOTPRINT_OVERLAP,
        ]);
        expect(codeOf(model, place("n", "vase", 9, 9))).toEqual([
            Code.NOT_ON_SURFACE,
        ]);

        const walled = clean();
        paintWall(walled, 6, 5, 0);
        expect(codeOf(walled, place("n", "crate", 6, 5))).toEqual([
            Code.CELL_BLOCKED_BY_WALL,
        ]);

        const full = clean([placedAt("d", "desk", 5, 5)]);
        full.limits = { objectsUsed: 1, objectsMax: 1 };
        expect(codeOf(full, place("n", "crate", 9, 9))).toEqual([
            Code.TOO_MANY_OBJECTS,
        ]);
    });

    it("refuses an unknown asset and a repeated tempId", () => {
        const model = clean([placedAt("c1", "crate", 5, 5)]);
        expect(codeOf(model, place("n", "ghost", 9, 9))).toEqual([
            Code.ASSET_NOT_IN_LIBRARY,
        ]);
        expect(codeOf(model, place("c1", "crate", 9, 9))).toEqual([
            Code.OBJECT_ID_TAKEN,
        ]);
    });
});

describe("applyEditorOp: remove_asset", () => {
    const withChildren = () =>
        clean([
            placedAt("d", "desk", 5, 5),
            placedAt("v", "vase", 6, 5, "d"),
            placedAt("g", "crate", 5, 8, "d"),
            placedAt("o", "crate", 12, 12),
        ]);

    it("removes a parent, its SURFACE child, and releases its GROUND child", () => {
        const model = withChildren();
        const snapshot = structuredClone(model);
        const result = apply(model, { type: "remove_asset", id: "d" });

        expect(result.model.placed).toEqual([
            placedAt("g", "crate", 5, 8),
            placedAt("o", "crate", 12, 12),
        ]);
        expect(result.model.limits.objectsUsed).toBe(2);
        expect(model).toEqual(snapshot);
    });

    it("undoing restores ids, positions and parentId", () => {
        const model = withChildren();
        const result = apply(model, { type: "remove_asset", id: "d" });
        expect(result.inverse.map(({ type }) => type)).toEqual([
            "place_asset",
            "place_asset",
            "move_asset",
        ]);

        // move_asset has no handler yet, so its effect is applied by hand.
        const moves = result.inverse.filter(
            ({ type }) => type === "move_asset"
        );
        const places = result.inverse.filter(
            ({ type }) => type !== "move_asset"
        );
        const placedBack = applyAll(result.model, places);
        const undone = placedBack.placed.map((object) => {
            const move = moves.find(
                (op) => op.type === "move_asset" && op.id === object.id
            );
            if (move?.type !== "move_asset") return object;
            return {
                ...object,
                tileX: move.tileX,
                tileY: move.tileY,
                offsetX: 0,
                offsetY: 0,
                parentId: move.parentId ?? null,
            };
        });

        expect(sorted(undone)).toEqual(sorted(model.placed));
        expect(placedBack.limits.objectsUsed).toBe(4);
    });

    it("keeps releaseDesk out of the validation and removes a leaf", () => {
        const model = clean([placedAt("c1", "crate", 5, 5)]);
        const result = apply(model, {
            type: "remove_asset",
            id: "c1",
            releaseDesk: true,
        });
        expect(result.model.placed).toEqual([]);
        expect(result.model.limits.objectsUsed).toBe(0);
        expect(applyAll(result.model, result.inverse)).toEqual(model);
    });

    describe("claimed desk", () => {
        const claimed = () => ({
            ...withChildren(),
            desks: [{ mapAssetId: "d", userId: "u1" }],
        });

        it("refuses removing it without releaseDesk", () => {
            expect(
                codeOf(claimed(), { type: "remove_asset", id: "d" })
            ).toEqual([Code.DESK_CLAIMED]);
        });

        it("removes it with releaseDesk and drops the claim", () => {
            const model = claimed();
            const result = apply(model, {
                type: "remove_asset",
                id: "d",
                releaseDesk: true,
            });
            expect(result.model.placed.map(({ id }) => id)).toEqual(["g", "o"]);
            expect(result.model.desks).toEqual([]);
            expect(model.desks).toHaveLength(1);
        });

        it("undoing brings the object back without its owner", () => {
            const model = claimed();
            const result = apply(model, {
                type: "remove_asset",
                id: "d",
                releaseDesk: true,
            });
            const undone = applyAll(result.model, result.inverse);
            expect(undone.placed.some(({ id }) => id === "d")).toBe(true);
            expect(undone.desks).toEqual([]);
        });

        it("removes a desk without owner normally", () => {
            const model = {
                ...withChildren(),
                desks: [{ mapAssetId: "other", userId: "u1" }],
            };
            const result = apply(model, { type: "remove_asset", id: "d" });
            expect(result.model.desks).toEqual(model.desks);
        });
    });

    it("refuses an unknown id", () => {
        expect(codeOf(clean(), { type: "remove_asset", id: "ghost" })).toEqual([
            Code.OBJECT_NOT_FOUND,
        ]);
    });
});
