import { describe, expect, it } from "vitest";
import {
    FLOOR_IMAGE_ID,
    WALL_IMAGE_ID,
} from "../../../layout/__tests__/fixtures";
import { LAYOUT_ISSUE_CODES as Code } from "../../../layout/issues";
import { findTileLayer } from "../../../layout/ops/findTileLayer";
import { findZonesGroup } from "../../../layout/ops/findZonesGroup";
import type { EditorOp } from "../../schemas/editorOp.schema";
import type { EditorModel } from "../../types/editor-model";
import { buildStampOps } from "../buildStampOps";
import {
    applyAll,
    buildBlankModel,
    buildMapModel,
    buildStamp,
    tempIds,
} from "./stampTestKit";

const build = (x = 3, y = 2, stamp = buildStamp()) => {
    const model = buildMapModel();
    const result = buildStampOps(model, stamp, x, y, tempIds());
    if (!result.ok) throw new Error(JSON.stringify(result.errors));
    return { model, result };
};

// The gid of a decoration tile of the wall tileset.
const decorationGid = (model: EditorModel) =>
    model.layout.tilesets.find(({ name }) => name === WALL_IMAGE_ID)!.firstgid +
    2;

const countOf = (ops: EditorOp[], type: EditorOp["type"]) =>
    ops.filter((op) => op.type === type).length;

describe("buildStampOps", () => {
    it("emits the cleanup, the paints, the objects and the zone in that order", () => {
        const { result } = build();
        const types = result.ops.map((op) => op.type);

        expect(countOf(result.ops, "erase")).toBeLessThanOrEqual(4);
        expect(countOf(result.ops, "paint_tiles")).toBe(4);
        expect(countOf(result.ops, "place_asset")).toBe(4);
        expect(countOf(result.ops, "set_zone")).toBe(1);
        expect(types).toEqual([
            ...types.filter((type) => type === "erase"),
            "paint_tiles",
            "paint_tiles",
            "paint_tiles",
            "paint_tiles",
            "place_asset",
            "place_asset",
            "place_asset",
            "place_asset",
            "set_zone",
        ]);
        expect(
            result.ops
                .filter((op) => op.type === "paint_tiles")
                .map((op) => op.layer)
        ).toEqual(["area-floor", "walls", "furniture", "foreground"]);
    });

    it("moves the tiles by the corner", () => {
        const { result } = build(3, 2);
        const ground = result.ops.find(
            (op) => op.type === "paint_tiles" && op.layer === "area-floor"
        );

        expect(ground).toEqual({
            type: "paint_tiles",
            layer: "area-floor",
            tiles: [
                {
                    tilesetId: FLOOR_IMAGE_ID,
                    tileIndex: 1,
                    cells: expect.arrayContaining([
                        [3, 2],
                        [6, 5],
                    ]),
                },
            ],
        });
        const layer = findTileLayer(result.model.layout, "area-floor")!;
        expect(layer.data[2 * result.model.width + 3]).not.toBe(layer.data[0]);
    });

    it("places the objects at the corner with their offsets and parent links", () => {
        const { result } = build(3, 2);
        const places = result.ops.filter((op) => op.type === "place_asset");

        expect(places).toEqual([
            {
                type: "place_asset",
                tempId: "tmp-1",
                assetId: "table",
                tileX: 4,
                tileY: 4,
                offsetX: 3,
                offsetY: -4,
                parentId: null,
            },
            expect.objectContaining({
                tempId: "tmp-2",
                assetId: "monitor",
                parentId: "tmp-1",
            }),
            expect.objectContaining({
                tempId: "tmp-3",
                assetId: "chair",
                tileX: 3,
                tileY: 5,
                offsetX: -2,
                offsetY: 5,
                parentId: null,
            }),
            expect.objectContaining({ tempId: "tmp-4", assetId: "poster" }),
        ]);
        expect(result.model.placed.map(({ id }) => id)).toEqual([
            "tmp-1",
            "tmp-2",
            "tmp-3",
            "tmp-4",
        ]);
        expect(result.model.limits.objectsUsed).toBe(4);
    });

    it("creates the area zone over the whole rectangle", () => {
        const { result } = build(3, 2);

        expect(result.ops.at(-1)).toEqual({
            type: "set_zone",
            zone: {
                kind: "area",
                rect: { x: 3, y: 2, w: 4, h: 4 },
                label: "Sala",
            },
        });
        expect(findZonesGroup(result.model.layout)?.objects).toHaveLength(2);
    });

    it("leaves the zone out when the stamp has none", () => {
        const { result } = build(3, 2, { ...buildStamp(), zone: null });

        expect(countOf(result.ops, "set_zone")).toBe(0);
    });

    it("erases what the map has where the stamp is empty and keeps the rest", () => {
        const model = buildMapModel();
        const stamp = {
            ...buildStamp(),
            layers: { ground: buildStamp().layers.ground },
            objects: [],
            zone: null,
        };
        // The map has a floor everywhere, and the stamp has furniture nowhere.
        const furniture = findTileLayer(model.layout, "furniture")!;
        furniture.data[2 * model.width + 3] = decorationGid(model);
        furniture.data[0] = decorationGid(model);

        const result = buildStampOps(model, stamp, 3, 2, tempIds());
        if (!result.ok) throw new Error(JSON.stringify(result.errors));

        expect(result.ops).toContainEqual({
            type: "erase",
            layer: "furniture",
            cells: [[3, 2]],
        });
        const after = findTileLayer(result.model.layout, "furniture")!;
        expect(after.data[2 * model.width + 3]).toBe(0);
        expect(after.data[0]).toBe(decorationGid(model));
    });

    it("undoes the whole placement, replaced tiles included", () => {
        const model = buildMapModel();
        const furniture = findTileLayer(model.layout, "furniture")!;
        furniture.data[2 * model.width + 3] = decorationGid(model);

        const built = buildStampOps(model, buildStamp(), 3, 2, tempIds());
        if (!built.ok) throw new Error(JSON.stringify(built.errors));

        const placed = applyAll(model, built.ops);
        expect(placed.model).toEqual(built.model);
        expect(placed.model.layout).not.toEqual(model.layout);

        const undone = applyAll(placed.model, placed.inverse);
        expect(undone.model).toEqual(model);
    });

    it("refuses a rectangle that leaves the map", () => {
        const model = buildMapModel();
        const stamp = buildStamp();

        for (const [x, y] of [
            [-1, 0],
            [0, -1],
            [model.width - 3, 0],
            [0, model.height - 3],
        ]) {
            const result = buildStampOps(model, stamp, x, y, tempIds());
            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.errors[0]?.code).toBe(Code.STAMP_OUT_OF_BOUNDS);
            }
        }
    });

    it("answers the errors of a failing operation and changes nothing", () => {
        const model = buildMapModel();
        const stamp = {
            ...buildStamp(),
            // A chair on the solid wall of the top row.
            objects: [
                {
                    assetId: "chair",
                    dx: 0,
                    dy: 0,
                    offsetX: 0,
                    offsetY: 0,
                    parentIndex: null,
                },
            ],
        };
        const before = structuredClone(model);

        const result = buildStampOps(model, stamp, 3, 2, tempIds());

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.errors[0]?.code).toBe(Code.CELL_BLOCKED_BY_WALL);
        }
        expect(model).toEqual(before);
    });

    it("rebuilds a stamp on a blank model of its own size", () => {
        const blank = buildBlankModel(4, 4);
        const result = buildStampOps(blank, buildStamp(), 0, 0, tempIds());

        expect(result.ok).toBe(true);
    });
});
