import { describe, expect, it } from "vitest";
import type { AssetDefinition } from "../../../../assets/types";
import type { LibraryPalette } from "../../../../assets/types/library";
import { buildLayout, library } from "../../../layout/__tests__/fixtures";
import { LAYOUT_ISSUE_CODES as Code } from "../../../layout/issues";
import { findTileLayer } from "../../../layout/ops/findTileLayer";
import type { PlacedAsset } from "../../../render/render-payload.schema";
import { REPLACE_INCOMPATIBLE_DETAILS as Detail } from "../../consts/replace-incompatible-details";
import type { EditorOp } from "../../schemas/editorOp.schema";
import type { EditorModel } from "../../types/editor-model";
import { applyEditorOp } from "../applyEditorOp";
import { canReplaceAsset } from "../canReplaceAsset";
import { getReplaceAlternatives } from "../getReplaceAlternatives";

const asset = (overrides: Partial<AssetDefinition>): AssetDefinition =>
    ({
        id: "a",
        category: "SITTING",
        type: "SOFA",
        placement: "GROUND",
        footprint: { w: 2, h: 1, offsetX: 0 },
        baseAssetId: null,
        rotation: null,
        colorKey: null,
        ...overrides,
    }) as AssetDefinition;

// Sofa family: 3 colors at DEG_0 and 2 colors at DEG_90 (1 x 2).
const sofa = asset({ id: "sofa", rotation: "DEG_0", colorKey: "red" });
const sofaBlue = asset({
    id: "sofa-blue",
    baseAssetId: "sofa",
    rotation: "DEG_0",
    colorKey: "blue",
});
const sofaGreen = asset({
    id: "sofa-green",
    baseAssetId: "sofa",
    rotation: "DEG_0",
    colorKey: "green",
});
const sofa90 = asset({
    id: "sofa-90",
    baseAssetId: "sofa",
    rotation: "DEG_90",
    colorKey: "red",
    footprint: { w: 1, h: 2, offsetX: 0 },
});
const sofa90Blue = asset({
    id: "sofa-90-blue",
    baseAssetId: "sofa",
    rotation: "DEG_90",
    colorKey: "blue",
    footprint: { w: 1, h: 2, offsetX: 0 },
});

// Two other models that can replace the sofa, one in blue only at DEG_0.
const couch = asset({ id: "couch", rotation: "DEG_0", colorKey: "red" });
const couchBlue = asset({
    id: "couch-blue",
    baseAssetId: "couch",
    rotation: "DEG_0",
    colorKey: "blue",
});
const wide = asset({
    id: "wide",
    rotation: "DEG_0",
    colorKey: "red",
    footprint: { w: 3, h: 1, offsetX: 0 },
});

// Never valid targets for the sofa.
const lamp = asset({
    id: "lamp",
    type: "TV",
    footprint: { w: 1, h: 1, offsetX: 0 },
});
const rug = asset({ id: "rug", category: "ROOM_DECOR" });
const shelf = asset({ id: "shelf", placement: "WALL" });

// Desk family for the SURFACE children.
const desk = asset({
    id: "desk",
    type: "DESK",
    rotation: "DEG_0",
    footprint: { w: 3, h: 1, offsetX: 0 },
});
const desk90 = asset({
    id: "desk-90",
    type: "DESK",
    baseAssetId: "desk",
    rotation: "DEG_90",
    footprint: { w: 1, h: 3, offsetX: 0 },
});
const shortDesk = asset({
    id: "short-desk",
    type: "DESK",
    footprint: { w: 2, h: 1, offsetX: 0 },
});
const vase = asset({
    id: "vase",
    type: "PLANT",
    placement: "SURFACE",
    footprint: { w: 1, h: 1, offsetX: 0 },
});

const palette = {
    tilesets: Object.values(library.tilesets).map(
        ({ id, tileCount, tileMeta }) => ({ id, tileCount, tileMeta })
    ),
    assets: [
        sofa,
        sofaBlue,
        sofaGreen,
        sofa90,
        sofa90Blue,
        couch,
        couchBlue,
        wide,
        lamp,
        rug,
        shelf,
        desk,
        desk90,
        shortDesk,
        vase,
    ],
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
    propertyOverrides: { label: id },
});

const buildModel = (placed: PlacedAsset[]): EditorModel => {
    const layout = buildLayout();
    findTileLayer(layout, "walls")!.data.fill(0);
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

const sofaAt = (tileX = 3, tileY = 5) => placedAt("s1", "sofa", tileX, tileY);

const incompatible = (detail: string) => ({
    ok: false,
    reason: Code.REPLACE_INCOMPATIBLE,
    detail,
});

describe("canReplaceAsset: color, rotation and model", () => {
    it("accepts another color of the same rotation", () => {
        const placed = sofaAt();
        const model = buildModel([placed]);
        expect(canReplaceAsset(model, placed, sofaBlue)).toEqual({ ok: true });
    });

    it("accepts another rotation of the same family", () => {
        const placed = sofaAt();
        const model = buildModel([placed]);
        expect(canReplaceAsset(model, placed, sofa90)).toEqual({ ok: true });
    });

    it("accepts a model with the same category, type and placement", () => {
        const placed = sofaAt();
        const model = buildModel([placed]);
        expect(canReplaceAsset(model, placed, couch)).toEqual({ ok: true });
        expect(canReplaceAsset(model, placed, wide)).toEqual({ ok: true });
    });

    it("refuses the same asset", () => {
        const placed = sofaAt();
        const model = buildModel([placed]);
        expect(canReplaceAsset(model, placed, sofa)).toEqual(
            incompatible(Detail.SAME_ASSET)
        );
    });

    it("refuses a model of another category, type or placement", () => {
        const placed = sofaAt();
        const model = buildModel([placed]);
        expect(canReplaceAsset(model, placed, rug)).toEqual(
            incompatible(Detail.DIFFERENT_CATEGORY)
        );
        expect(canReplaceAsset(model, placed, lamp)).toEqual(
            incompatible(Detail.DIFFERENT_TYPE)
        );
        expect(canReplaceAsset(model, placed, shelf)).toEqual(
            incompatible(Detail.DIFFERENT_PLACEMENT)
        );
    });

    it("refuses when the object asset is not in the library", () => {
        const placed = placedAt("s1", "ghost", 3, 5);
        const model = buildModel([placed]);
        expect(canReplaceAsset(model, placed, couch)).toEqual(
            incompatible(Detail.CURRENT_ASSET_UNKNOWN)
        );
    });
});

describe("canReplaceAsset: the new footprint and the children", () => {
    it("keeps the bottom left anchor when the footprint changes", () => {
        const placed = sofaAt(3, 5);
        const model = buildModel([placed]);
        const taller = buildModel([placed, placedAt("x", "lamp", 3, 4)]);
        expect(canReplaceAsset(model, placed, sofa90)).toEqual({ ok: true });
        expect(canReplaceAsset(taller, placed, sofa90)).toEqual(
            incompatible(Code.FOOTPRINT_OVERLAP)
        );
    });

    it("refuses a footprint outside the map", () => {
        const top = sofaAt(3, 0);
        const edge = sofaAt(0, 5);
        expect(canReplaceAsset(buildModel([top]), top, sofa90)).toEqual(
            incompatible(Code.CELL_OUT_OF_BOUNDS)
        );
        const model = buildModel([edge]);
        expect(canReplaceAsset(model, edge, wide)).toEqual({ ok: true });
        const last = sofaAt(buildModel([]).width - 2, 5);
        expect(canReplaceAsset(buildModel([last]), last, wide)).toEqual(
            incompatible(Code.CELL_OUT_OF_BOUNDS)
        );
    });

    it("refuses when a SURFACE child would leave the new footprint", () => {
        const table = placedAt("d1", "desk", 3, 5);
        const item = placedAt("v1", "vase", 5, 5, "d1");
        const model = buildModel([table, item]);
        expect(canReplaceAsset(model, table, desk90)).toEqual(
            incompatible(Detail.CHILD_OUTSIDE_FOOTPRINT)
        );
        expect(canReplaceAsset(model, table, shortDesk)).toEqual(
            incompatible(Detail.CHILD_OUTSIDE_FOOTPRINT)
        );
    });

    it("accepts when the SURFACE child stays inside", () => {
        const table = placedAt("d1", "desk", 3, 5);
        const item = placedAt("v1", "vase", 4, 5, "d1");
        const model = buildModel([table, item]);
        expect(canReplaceAsset(model, table, shortDesk)).toEqual({ ok: true });
    });
});

describe("getReplaceAlternatives", () => {
    it("lists colors, the next rotation and models, filtered", () => {
        const placed = sofaAt();
        const model = buildModel([placed]);
        const result = getReplaceAlternatives(model, placed);

        expect(result.colors.map(({ id }) => id)).toEqual([
            "sofa-blue",
            "sofa-green",
        ]);
        expect(result.rotations.map(({ id }) => id)).toEqual(["sofa-90"]);
        expect(result.models.map(({ id }) => id)).toEqual(["couch", "wide"]);
    });

    it("keeps the color on a rotation and on a model", () => {
        const placed = placedAt("s1", "sofa-blue", 3, 5);
        const model = buildModel([placed]);
        const result = getReplaceAlternatives(model, placed);

        expect(result.rotations.map(({ id }) => id)).toEqual(["sofa-90-blue"]);
        expect(result.models.map(({ id }) => id)).toEqual([
            "couch-blue",
            "wide",
        ]);
    });

    it("wraps the rotation around and drops what does not fit", () => {
        const rotated = placedAt("s1", "sofa-90", 3, 5);
        const back = getReplaceAlternatives(buildModel([rotated]), rotated);
        expect(back.rotations.map(({ id }) => id)).toEqual(["sofa"]);

        const top = placedAt("s1", "sofa", 3, 0);
        const none = getReplaceAlternatives(buildModel([top]), top);
        expect(none.rotations).toEqual([]);
        expect(none.colors).toHaveLength(2);
    });

    it("is empty for an unknown object asset", () => {
        const placed = placedAt("s1", "ghost", 3, 5);
        expect(getReplaceAlternatives(buildModel([placed]), placed)).toEqual({
            colors: [],
            rotations: [],
            models: [],
        });
    });
});

describe("applyEditorOp: replace_asset", () => {
    const replace = (assetId: string): EditorOp => ({
        type: "replace_asset",
        id: "d1",
        assetId,
    });

    it("swaps the asset and keeps position, parent, children and overrides", () => {
        const table = placedAt("d1", "desk", 3, 5);
        const item = placedAt("v1", "vase", 4, 5, "d1");
        const model = buildModel([table, item]);
        const before = structuredClone(model);

        const result = applyEditorOp(model, replace("short-desk"));

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.model.placed).toEqual([
            { ...table, assetId: "short-desk" },
            item,
        ]);
        expect(result.model.limits).toEqual(model.limits);
        expect(model).toEqual(before);
    });

    it("undoes with the previous asset id", () => {
        const model = buildModel([placedAt("d1", "desk", 3, 5)]);
        const result = applyEditorOp(model, replace("short-desk"));

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.inverse).toEqual([replace("desk")]);

        const undone = applyEditorOp(result.model, result.inverse[0]);
        expect(undone.ok).toBe(true);
        if (undone.ok) expect(undone.model.placed).toEqual(model.placed);
    });

    it("reports a missing object, a missing asset and an incompatible one", () => {
        const model = buildModel([placedAt("d1", "desk", 3, 5)]);
        const codeOf = (op: EditorOp) => {
            const result = applyEditorOp(model, op);
            return result.ok ? null : result.errors[0].code;
        };

        expect(
            codeOf({ type: "replace_asset", id: "nope", assetId: "short-desk" })
        ).toBe(Code.OBJECT_NOT_FOUND);
        expect(codeOf(replace("nope"))).toBe(Code.ASSET_NOT_IN_LIBRARY);
        expect(codeOf(replace("rug"))).toBe(Code.REPLACE_INCOMPATIBLE);
    });
});
