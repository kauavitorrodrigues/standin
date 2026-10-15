import { describe, expect, it } from "vitest";
import { LAYOUT_ISSUE_CODES, MAX_CELLS_PER_OP } from "@standin/contracts";
import type { Cell, EditorModel } from "@standin/contracts";
import {
    buildTileModel,
    DECO_TILE,
    FLOOR_TILE,
    WALL_TILE,
} from "@/features/editor/lib/__tests__/fixtures/buildTileModel";
import { buildEraseOps } from "@/features/editor/utils/buildEraseOps";
import { buildPaintOps } from "@/features/editor/utils/buildPaintOps";
import { findPickedTile } from "@/features/editor/utils/findPickedTile";
import { getBrushLayer } from "@/features/editor/utils/getBrushLayer";
import { getConflictHint } from "@/features/editor/utils/getConflictHint";
import { getTilesetLimitHint } from "@/features/editor/utils/getTilesetLimitHint";

const floor = { tilesetId: "ts-1", tileIndex: FLOOR_TILE };
const wall = { tilesetId: "ts-1", tileIndex: WALL_TILE };

const withGid = (
    model: EditorModel,
    layer: string,
    [x, y]: Cell,
    gid: number
): EditorModel => {
    const target = model.layout.layers.find(({ name }) => name === layer);
    if (target?.type === "tilelayer") target.data[y * model.width + x] = gid;
    return model;
};

const withGroundObject = (): EditorModel =>
    buildTileModel({
        assets: [
            {
                id: "chair",
                placement: "GROUND",
                footprint: { w: 1, h: 1, offsetX: 0 },
            },
        ],
        placed: [
            {
                id: "p1",
                assetId: "chair",
                tileX: 2,
                tileY: 2,
                parentId: null,
                propertyOverrides: null,
            },
        ],
    });

describe("getBrushLayer", () => {
    it("sends each category to its layer", () => {
        const model = buildTileModel();

        expect(getBrushLayer(model, floor)).toBe("ground");
        expect(getBrushLayer(model, wall)).toBe("walls");
        expect(getBrushLayer(model, { ...floor, tileIndex: DECO_TILE })).toBe(
            "furniture"
        );
    });

    it("is null for a tile with no entry in the tileMeta", () => {
        expect(
            getBrushLayer(buildTileModel(), { ...floor, tileIndex: 9 })
        ).toBeNull();
    });
});

describe("buildPaintOps", () => {
    it("builds one paint with the exact shape", () => {
        const model = buildTileModel();
        const cells: Cell[] = [
            [0, 0],
            [1, 0],
        ];

        const { ops, conflicts } = buildPaintOps(model, floor, "ground", cells);

        expect(conflicts).toEqual([]);
        expect(ops).toEqual([
            {
                type: "paint",
                layer: "ground",
                tilesetId: "ts-1",
                tileIndex: FLOOR_TILE,
                cells,
            },
        ]);
    });

    it("leaves out the cells that already hold the tile", () => {
        const model = withGid(buildTileModel(), "ground", [0, 0], 1);

        const { ops } = buildPaintOps(model, floor, "ground", [
            [0, 0],
            [1, 0],
        ]);

        expect(ops).toEqual([expect.objectContaining({ cells: [[1, 0]] })]);
    });

    it("sends nothing when every cell already holds the tile", () => {
        const model = withGid(buildTileModel(), "ground", [0, 0], 1);

        expect(buildPaintOps(model, floor, "ground", [[0, 0]]).ops).toEqual([]);
    });

    it("splits a gesture over MAX_CELLS_PER_OP into blocks", () => {
        const model = buildTileModel({ size: 60 });
        const cells: Cell[] = [];
        for (let y = 0; y < 60; y++) {
            for (let x = 0; x < 60; x++) cells.push([x, y]);
        }

        const { ops } = buildPaintOps(model, floor, "ground", cells);

        expect(ops).toHaveLength(2);
        expect(ops[0]).toMatchObject({ type: "paint" });
        expect(ops.map((op) => ("cells" in op ? op.cells.length : 0))).toEqual([
            MAX_CELLS_PER_OP,
            3600 - MAX_CELLS_PER_OP,
        ]);
    });

    it("drops the cells that conflict with an object and reports them", () => {
        const model = withGroundObject();

        const { ops, conflicts } = buildPaintOps(model, wall, "walls", [
            [1, 2],
            [2, 2],
        ]);

        expect(ops).toEqual([expect.objectContaining({ cells: [[1, 2]] })]);
        expect(conflicts).toEqual([
            {
                cell: [2, 2],
                code: LAYOUT_ISSUE_CODES.CELL_OCCUPIED_BY_OBJECT,
            },
        ]);
    });
});

describe("buildEraseOps", () => {
    it("builds one erase with the exact shape, only for filled cells", () => {
        const model = withGid(buildTileModel(), "ground", [1, 1], 1);

        const { ops } = buildEraseOps(
            model,
            ["ground"],
            [
                [0, 0],
                [1, 1],
            ]
        );

        expect(ops).toEqual([
            { type: "erase", layer: "ground", cells: [[1, 1]] },
        ]);
    });

    it("erases in every layer given, each one with its own operation", () => {
        const model = withGid(
            withGid(buildTileModel(), "ground", [1, 1], 1),
            "walls",
            [1, 1],
            2
        );

        const { ops } = buildEraseOps(model, ["walls", "ground"], [[1, 1]]);

        expect(ops).toEqual([
            { type: "erase", layer: "walls", cells: [[1, 1]] },
            { type: "erase", layer: "ground", cells: [[1, 1]] },
        ]);
    });

    it("sends nothing on an empty layer", () => {
        expect(
            buildEraseOps(buildTileModel(), ["ground"], [[0, 0]]).ops
        ).toEqual([]);
    });
});

describe("findPickedTile", () => {
    it("reads the tile and its layer under the cell", () => {
        const model = withGid(buildTileModel(), "walls", [1, 1], 2);

        expect(findPickedTile(model, [1, 1])).toEqual({
            brush: wall,
            layer: "walls",
        });
    });

    it("prefers the wall over the floor under it", () => {
        const model = withGid(buildTileModel(), "ground", [1, 1], 1);
        withGid(model, "walls", [1, 1], 2);

        expect(findPickedTile(model, [1, 1])?.layer).toBe("walls");
    });

    it("is null for an empty cell", () => {
        expect(findPickedTile(buildTileModel(), [1, 1])).toBeNull();
    });
});

describe("hints", () => {
    it("explains the cells left out", () => {
        expect(getConflictHint([])).toBeNull();
        expect(
            getConflictHint([
                {
                    cell: [0, 0],
                    code: LAYOUT_ISSUE_CODES.CELL_OCCUPIED_BY_OBJECT,
                },
            ])
        ).toBe("1 célula ignorada: há um objeto sobre a célula");
    });

    it("warns about more tilesets than the map takes, without blocking", () => {
        const tilesets = Array.from({ length: 8 }, (_, index) => ({
            name: `ts-${index}`,
            firstgid: index + 1,
        }));

        expect(getTilesetLimitHint({ tilesets }, "ts-0")).toBeNull();
        expect(getTilesetLimitHint({ tilesets }, "novo")).toContain("8");
    });
});
