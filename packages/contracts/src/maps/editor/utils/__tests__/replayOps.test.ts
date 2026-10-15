import { describe, expect, it } from "vitest";
import type { AssetDefinition } from "../../../../assets/types";
import type { LibraryPalette } from "../../../../assets/types/library";
import {
    FLOOR_IMAGE_ID,
    buildLayout,
    library,
} from "../../../layout/__tests__/fixtures";
import { findTileLayer } from "../../../layout/ops/findTileLayer";
import type { EditorOp } from "../../schemas/editorOp.schema";
import type { EditorModel } from "../../types/editor-model";
import { applyEditorOp } from "../applyEditorOp";
import { replayOps } from "../replayOps";

const crate = {
    id: "crate",
    type: "DECORATION",
    placement: "GROUND",
    footprint: { w: 1, h: 1, offsetX: 0 },
} as AssetDefinition;

const palette = {
    tilesets: Object.values(library.tilesets).map(
        ({ id, tileCount, tileMeta }) => ({ id, tileCount, tileMeta })
    ),
    assets: [crate],
    categories: [],
} as unknown as LibraryPalette;

const buildModel = (): EditorModel => {
    const layout = buildLayout();
    findTileLayer(layout, "walls")!.data.fill(0);
    return {
        mapId: "map-1",
        width: layout.width,
        height: layout.height,
        layout,
        placed: [],
        library: palette,
        desks: [],
        limits: { objectsUsed: 0, objectsMax: 100 },
        version: 1,
    };
};

const ops: EditorOp[] = [
    {
        type: "paint",
        layer: "ground",
        tilesetId: FLOOR_IMAGE_ID,
        tileIndex: 0,
        cells: [
            [3, 3],
            [4, 3],
        ],
    },
    { type: "place_asset", tempId: "c1", assetId: "crate", tileX: 5, tileY: 5 },
    { type: "move_asset", id: "c1", tileX: 6, tileY: 5 },
    { type: "set_background", color: "#112233" },
];

const applyOneByOne = (base: EditorModel, list: EditorOp[]): EditorModel =>
    list.reduce((current, op) => {
        const result = applyEditorOp(current, op);
        if (!result.ok) throw new Error(result.errors[0]?.code);
        return result.model;
    }, base);

describe("replayOps", () => {
    it("gives the same model as applying the operations one by one", () => {
        const base = buildModel();
        const result = replayOps(base, ops);

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.model).toEqual(applyOneByOne(base, ops));
        expect(result.model.placed).toHaveLength(1);
    });

    it("fails in the middle and answers the index of the first failure", () => {
        const base = buildModel();
        const broken: EditorOp[] = [
            ops[0],
            ops[1],
            { type: "move_asset", id: "missing", tileX: 1, tileY: 1 },
            ops[3],
        ];
        const result = replayOps(base, broken);

        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.opIndex).toBe(2);
        expect(result.errors.length).toBeGreaterThan(0);
    });

    it("does not mutate the base model", () => {
        const base = buildModel();
        const snapshot = structuredClone(base);
        replayOps(base, ops);

        expect(base).toEqual(snapshot);
    });

    it("returns the base content for an empty list", () => {
        const base = buildModel();
        const result = replayOps(base, []);

        expect(result).toEqual({ ok: true, model: base });
    });
});
