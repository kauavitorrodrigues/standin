import { describe, expect, it } from "vitest";
import { applyEditorOp } from "../applyEditorOp";
import { MAX_CELLS_PER_OP } from "../../consts/limits";
import type { EditorModel } from "../../types/editor-model";
import type { EditorOp } from "../../schemas/editorOp.schema";
import type { LibraryPalette } from "../../../../assets/types/library";
import {
    FLOOR_IMAGE_ID,
    PRIVATE_IMAGE_ID,
    WALL_IMAGE_ID,
    buildLayout,
    library,
} from "../../../layout/__tests__/fixtures";
import { LAYOUT_ISSUE_CODES as Code } from "../../../layout/issues";
import { findTileLayer } from "../../../layout/ops/findTileLayer";
import { findZonesGroup } from "../../../layout/ops/findZonesGroup";
import { TILE_SIZE } from "../../../consts/constants";

const palette = {
    tilesets: Object.values(library.tilesets).map(
        ({ id, tileCount, tileMeta }) => ({ id, tileCount, tileMeta })
    ),
    assets: [],
    categories: [],
    areas: [],
} as unknown as LibraryPalette;

const buildModel = (): EditorModel => {
    const layout = buildLayout();
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

// The inverse of a step, applied in order, must give the layout back.
const undo = (model: EditorModel, inverse: EditorOp[]): EditorModel =>
    inverse.reduce((current, op) => apply(current, op).model, model);

const gidAt = (model: EditorModel, layer: string, x: number, y: number) =>
    findTileLayer(model.layout, layer)?.data[y * model.layout.width + x];

describe("applyEditorOp: paint and erase", () => {
    it("paints a floor tile and the inverse erases it", () => {
        const model = buildModel();
        const result = apply(model, {
            type: "paint",
            layer: "ground",
            tilesetId: FLOOR_IMAGE_ID,
            tileIndex: 1,
            cells: [[3, 3]],
        });

        expect(gidAt(result.model, "ground", 3, 3)).toBe(2);
        expect(result.diff).toEqual([
            { layer: "ground", x: 3, y: 3, before: 1, after: 2 },
        ]);
        expect(undo(result.model, result.inverse).layout).toEqual(model.layout);
    });

    it("writes the wall top on the foreground and the inverse removes it", () => {
        const model = buildModel();
        const result = apply(model, {
            type: "paint",
            layer: "walls",
            tilesetId: WALL_IMAGE_ID,
            tileIndex: 0,
            cells: [[5, 5]],
        });

        const wallGid = gidAt(result.model, "walls", 5, 5) as number;
        expect(gidAt(result.model, "foreground", 5, 4)).toBe(wallGid + 1);
        expect(result.diff.map(({ layer }) => layer).sort()).toEqual([
            "foreground",
            "walls",
        ]);
        expect(undo(result.model, result.inverse).layout).toEqual(model.layout);
    });

    it("adds a new tileset and the inverse takes it back out", () => {
        const model = buildModel();
        const result = apply(model, {
            type: "paint",
            layer: "ground",
            tilesetId: PRIVATE_IMAGE_ID,
            tileIndex: 0,
            cells: [[2, 2]],
        });

        expect(result.model.layout.tilesets).toHaveLength(
            model.layout.tilesets.length + 1
        );
        expect(undo(result.model, result.inverse).layout).toEqual(model.layout);
    });

    it("erases a wall together with its derived top, and the inverse restores both", () => {
        const withWall = apply(buildModel(), {
            type: "paint",
            layer: "walls",
            tilesetId: WALL_IMAGE_ID,
            tileIndex: 0,
            cells: [[5, 5]],
        }).model;

        const erased = apply(withWall, {
            type: "erase",
            layer: "walls",
            cells: [[5, 5]],
        });

        expect(gidAt(erased.model, "walls", 5, 5)).toBe(0);
        expect(gidAt(erased.model, "foreground", 5, 4)).toBe(0);
        expect(undo(erased.model, erased.inverse).layout).toEqual(
            withWall.layout
        );
    });

    it("restores a top erased on its own", () => {
        const withWall = apply(buildModel(), {
            type: "paint",
            layer: "walls",
            tilesetId: WALL_IMAGE_ID,
            tileIndex: 0,
            cells: [[5, 5]],
        }).model;

        const erased = apply(withWall, {
            type: "erase",
            layer: "foreground",
            cells: [[5, 4]],
        });

        expect(erased.inverse.length).toBeGreaterThan(0);
        expect(undo(erased.model, erased.inverse).layout).toEqual(
            withWall.layout
        );
    });

    it("splits a large inverse in blocks of MAX_CELLS_PER_OP", () => {
        const model = buildModel();
        const cells: [number, number][] = [];
        for (let y = 1; y < 13 && cells.length < MAX_CELLS_PER_OP; y++) {
            for (let x = 1; x < 19; x++) cells.push([x, y]);
        }
        const painted = apply(model, {
            type: "paint",
            layer: "furniture",
            tilesetId: WALL_IMAGE_ID,
            tileIndex: 2,
            cells,
        });

        expect(painted.inverse.every((op) => op.type === "erase")).toBe(true);
        expect(undo(painted.model, painted.inverse).layout).toEqual(
            model.layout
        );
    });

    it("reports a cell outside the map", () => {
        const result = applyEditorOp(buildModel(), {
            type: "erase",
            layer: "ground",
            cells: [[999, 0]],
        });

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.errors[0].code).toBe(Code.CELL_OUT_OF_BOUNDS);
        }
    });

    it("never mutates the model it receives", () => {
        const model = buildModel();
        const snapshot = structuredClone(model);

        apply(model, {
            type: "paint",
            layer: "walls",
            tilesetId: WALL_IMAGE_ID,
            tileIndex: 0,
            cells: [[5, 5]],
        });
        apply(model, { type: "set_background", color: "#123456" });
        apply(model, {
            type: "set_zone",
            zone: { kind: "spawn", rect: { x: 1, y: 1, w: 1, h: 1 } },
        });

        expect(model).toEqual(snapshot);
    });
});

describe("applyEditorOp: background", () => {
    it("sets the background and the inverse brings the previous color back", () => {
        const first = apply(buildModel(), {
            type: "set_background",
            color: "#112233",
        });
        const second = apply(first.model, {
            type: "set_background",
            color: "#445566",
        });

        expect(second.model.layout.backgroundcolor).toBe("#445566");
        expect(second.inverse).toEqual([
            { type: "set_background", color: "#112233" },
        ]);
        expect(undo(second.model, second.inverse).layout).toEqual(
            first.model.layout
        );
    });
});

describe("applyEditorOp: zones", () => {
    it("creates a spawn and an area in pixels, and undoes both", () => {
        const model = buildModel();
        const spawn = apply(model, {
            type: "set_zone",
            zone: { kind: "spawn", rect: { x: 2, y: 3, w: 1, h: 1 } },
        });
        const area = apply(spawn.model, {
            type: "set_zone",
            zone: {
                kind: "area",
                label: "Sala",
                rect: { x: 4, y: 5, w: 3, h: 2 },
            },
        });

        const objects = findZonesGroup(area.model.layout)?.objects ?? [];
        const created = objects.find(({ id }) => id === 3);
        expect(created).toMatchObject({
            x: 4 * TILE_SIZE,
            y: 5 * TILE_SIZE,
            width: 3 * TILE_SIZE,
            height: 2 * TILE_SIZE,
        });

        expect(undo(area.model, area.inverse).layout).toEqual(
            spawn.model.layout
        );
        expect(undo(spawn.model, spawn.inverse).layout).toEqual(model.layout);
    });

    it("moves and resizes a zone, and the inverse restores the old rect", () => {
        const created = apply(buildModel(), {
            type: "set_zone",
            zone: {
                kind: "area",
                label: "Sala",
                rect: { x: 4, y: 5, w: 3, h: 2 },
            },
        });
        const moved = apply(created.model, {
            type: "set_zone",
            zone: {
                id: 2,
                kind: "area",
                label: "Sala",
                rect: { x: 6, y: 6, w: 4, h: 4 },
            },
        });

        expect(moved.inverse).toEqual([
            {
                type: "set_zone",
                zone: {
                    id: 2,
                    kind: "area",
                    label: "Sala",
                    rect: { x: 4, y: 5, w: 3, h: 2 },
                },
            },
        ]);
        expect(undo(moved.model, moved.inverse).layout).toEqual(
            created.model.layout
        );
    });

    it("removes a zone and the inverse puts it back, same id", () => {
        const created = apply(buildModel(), {
            type: "set_zone",
            zone: {
                kind: "area",
                label: "Sala",
                rect: { x: 4, y: 5, w: 3, h: 2 },
            },
        });
        const removed = apply(created.model, {
            type: "remove_zone",
            zoneId: 2,
        });

        expect(undo(removed.model, removed.inverse).layout).toEqual(
            created.model.layout
        );
    });

    it("refuses to remove the last spawn", () => {
        const result = applyEditorOp(buildModel(), {
            type: "remove_zone",
            zoneId: 1,
        });

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.errors[0].code).toBe(Code.SPAWN_MISSING);
        }
    });

    it("reports a clear issue when the removed zone is of another kind", () => {
        const model = buildModel();
        const group = findZonesGroup(model.layout);
        group?.objects.push({
            id: 9,
            name: "private",
            type: "",
            x: 0,
            y: 0,
            width: TILE_SIZE * 2,
            height: TILE_SIZE * 2,
            rotation: 0,
            visible: true,
            properties: [
                { name: "kind", type: "string", value: "private" },
                { name: "label", type: "string", value: "Sala" },
                { name: "key", type: "string", value: "k" },
            ],
        });

        const result = applyEditorOp(model, { type: "remove_zone", zoneId: 9 });

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.errors[0].code).toBe(Code.ZONE_KIND_INVALID);
        }
    });
});
