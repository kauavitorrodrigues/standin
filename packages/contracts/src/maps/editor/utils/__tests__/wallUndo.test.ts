import { describe, expect, it } from "vitest";
import type { LibraryPalette } from "../../../../assets/types/library";
import { defaults } from "../../../layout/__tests__/fixtures";
import { generateBlankLayout } from "../../../layout/generateBlankLayout";
import { THIN_ID, buildLibrary } from "../../../layout/__tests__/thinWallKit";
import { findTileLayer } from "../../../layout/ops/findTileLayer";
import type { EditorOp } from "../../schemas/editorOp.schema";
import type { EditorModel } from "../../types/editor-model";
import { applyEditorOp } from "../applyEditorOp";
import { replayOps } from "../replayOps";

const library = buildLibrary();
const palette = {
    tilesets: Object.values(library.tilesets).map(
        ({ id, tileCount, tileMeta }) => ({ id, tileCount, tileMeta })
    ),
    assets: [],
    categories: [],
    areas: [],
} as unknown as LibraryPalette;

const buildModel = (): EditorModel => {
    const layout = generateBlankLayout("XS", { floor: defaults.floor });
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

const apply = (model: EditorModel, op: EditorOp) => {
    const result = applyEditorOp(model, op);
    if (!result.ok) throw new Error(JSON.stringify(result.errors));
    return result;
};

const undo = (model: EditorModel, inverse: EditorOp[]): EditorModel =>
    inverse.reduce((current, op) => apply(current, op).model, model);

const snapshot = (model: EditorModel) =>
    ["walls", "foreground"].map(
        (name) => findTileLayer(model.layout, name)?.data.join(",") ?? ""
    );

const outline: [number, number][] = [];
for (let x = 3; x <= 8; x++) {
    for (let y = 3; y <= 6; y++) {
        if (x === 3 || x === 8 || y === 3 || y === 6) outline.push([x, y]);
    }
}

const paintOp: EditorOp = {
    type: "paint",
    layer: "walls",
    tilesetId: THIN_ID,
    tileIndex: 4,
    cells: outline,
};

describe("wall pieces through the editor ops", () => {
    it("undoes a painted outline back to the empty layers", () => {
        const start = buildModel();
        const painted = apply(start, paintOp);

        expect(snapshot(painted.model)).not.toEqual(snapshot(start));
        expect(snapshot(undo(painted.model, painted.inverse))).toEqual(
            snapshot(start)
        );
    });

    it("undoes an erase, neighbor pieces and tops included", () => {
        const drawn = apply(buildModel(), paintOp).model;
        const erased = apply(drawn, {
            type: "erase",
            layer: "walls",
            cells: [
                [5, 3],
                [6, 3],
                [3, 5],
            ],
        });

        expect(snapshot(undo(erased.model, erased.inverse))).toEqual(
            snapshot(drawn)
        );
    });

    it("undoes the paint that turns a line into a corner, one step at a time", () => {
        const line = apply(buildModel(), {
            ...paintOp,
            cells: [
                [3, 3],
                [4, 3],
                [5, 3],
            ],
        });
        const turned = apply(line.model, { ...paintOp, cells: [[3, 4]] });

        expect(snapshot(turned.model)).not.toEqual(snapshot(line.model));
        expect(snapshot(undo(turned.model, turned.inverse))).toEqual(
            snapshot(line.model)
        );
    });

    it("replays the same ops to the same layers", () => {
        const ops: EditorOp[] = [
            paintOp,
            { type: "erase", layer: "walls", cells: [[5, 6]] },
        ];
        const once = replayOps(buildModel(), ops);
        const twice = replayOps(buildModel(), ops);

        if (!once.ok || !twice.ok) throw new Error("replay failed");
        expect(snapshot(once.model)).toEqual(snapshot(twice.model));
    });
});
