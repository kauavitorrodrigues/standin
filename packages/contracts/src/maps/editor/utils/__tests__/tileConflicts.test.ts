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
import { findTileConflicts } from "../findTileConflicts";

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



const clean = (placed: PlacedAsset[] = []) => {
    const model = buildModel(placed);
    clearWalls(model);
    return model;
};

type PaintOp = Extract<EditorOp, { type: "paint" }>;

const wallOp = (cells: [number, number][]): PaintOp => ({
    type: "paint",
    layer: "walls",
    tilesetId: WALL_IMAGE_ID,
    tileIndex: 0,
    cells,
});

const eraseWalls = (cells: [number, number][]): EditorOp => ({
    type: "erase",
    layer: "walls",
    cells,
});

const codesOf = (model: EditorModel, op: EditorOp) => {
    const result = applyEditorOp(model, op);
    return result.ok ? null : result.errors.map(({ code }) => code);
};

describe("tile and object conflicts", () => {
    it("refuses a wall paint over a GROUND object", () => {
        const model = clean([placedAt("c", "crate", 5, 5)]);
        expect(codesOf(model, wallOp([[5, 5]]))).toEqual([
            Code.CELL_OCCUPIED_BY_OBJECT,
        ]);
    });

    it("covers every cell of a large footprint", () => {
        const model = clean([placedAt("b", "big", 5, 5)]);
        expect(codesOf(model, wallOp([[6, 4]]))).toEqual([
            Code.CELL_OCCUPIED_BY_OBJECT,
        ]);
    });

    it("allows a floor paint over a GROUND object", () => {
        const model = clean([placedAt("c", "crate", 5, 5)]);
        const result = applyEditorOp(model, {
            type: "paint",
            layer: "ground",
            tilesetId: "tileset-floor",
            tileIndex: 1,
            cells: [[5, 5]],
        });
        expect(result.ok).toBe(true);
    });

    it("refuses erasing a wall under a poster", () => {
        const model = clean([placedAt("p", "poster", 5, 5)]);
        paintWall(model, 5, 5, 0);
        expect(codesOf(model, eraseWalls([[5, 5]]))).toEqual([
            Code.WALL_HAS_MOUNTED_OBJECT,
        ]);
    });

    it("refuses replacing a mounted wall with a non wall tile", () => {
        const model = clean([placedAt("p", "poster", 5, 5)]);
        paintWall(model, 5, 5, 0);
        expect(
            codesOf(model, { ...wallOp([[5, 5]]), tileIndex: 2 })
        ).toEqual([Code.WALL_HAS_MOUNTED_OBJECT]);
    });

    it("allows erasing a wall with nothing mounted", () => {
        const model = clean([placedAt("p", "poster", 8, 8)]);
        paintWall(model, 5, 5, 0);
        expect(applyEditorOp(model, eraseWalls([[5, 5]])).ok).toBe(true);
    });

    it("lists only the bad cells of a mixed operation", () => {
        const model = clean([placedAt("c", "crate", 5, 5)]);
        const op = wallOp([
            [4, 4],
            [5, 5],
            [6, 6],
        ]);
        expect(findTileConflicts(model, op)).toEqual([
            { cell: [5, 5], code: Code.CELL_OCCUPIED_BY_OBJECT },
        ]);
        expect(codesOf(model, op)).toEqual([Code.CELL_OCCUPIED_BY_OBJECT]);
    });

    it("changes nothing without objects", () => {
        const model = clean();
        expect(findTileConflicts(model, wallOp([[5, 5]]))).toEqual(
            []
        );
        expect(applyEditorOp(model, wallOp([[5, 5]])).ok).toBe(true);
    });
});
