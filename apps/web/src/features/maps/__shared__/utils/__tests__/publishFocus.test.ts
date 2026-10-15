import { describe, expect, it } from "vitest";
import type {
    EditorModel,
    EditorOp,
    PlacedAsset,
    PublishIssue,
} from "@standin/contracts";
import { describePublishIssue } from "@/features/maps/__shared__/utils/describePublishIssue";
import { getOpFocusCell } from "@/features/maps/__shared__/utils/getOpFocusCell";
import { getPublishIssueRows } from "@/features/maps/__shared__/utils/getPublishIssueRows";

const placed = (id: string, tileX: number, tileY: number): PlacedAsset => ({
    id,
    assetId: "asset-1",
    tileX,
    tileY,
    offsetX: 0,
    offsetY: 0,
    parentId: null,
    propertyOverrides: null,
});

const PLACED = [placed("obj-1", 7, 9)];

describe("getOpFocusCell", () => {
    it("goes to the first cell of a paint or an erase", () => {
        const paint: EditorOp = {
            type: "paint",
            layer: "ground",
            tilesetId: "t",
            tileIndex: 0,
            cells: [
                [3, 4],
                [5, 6],
            ],
        };
        const erase: EditorOp = {
            type: "erase",
            layer: "walls",
            cells: [[1, 2]],
        };

        expect(getOpFocusCell(paint, PLACED)).toEqual([3, 4]);
        expect(getOpFocusCell(erase, PLACED)).toEqual([1, 2]);
        expect(
            getOpFocusCell({ type: "erase", layer: "walls", cells: [] }, PLACED)
        ).toBeNull();
    });

    it("goes to the first cell of the first tile group of a paint_tiles", () => {
        const op: EditorOp = {
            type: "paint_tiles",
            layer: "ground",
            tiles: [
                { tilesetId: "t", tileIndex: 0, cells: [[6, 7]] },
                { tilesetId: "t", tileIndex: 1, cells: [[1, 1]] },
            ],
        };
        expect(getOpFocusCell(op, PLACED)).toEqual([6, 7]);
    });

    it("goes to the tile of a new or moved object", () => {
        expect(
            getOpFocusCell(
                {
                    type: "place_asset",
                    tempId: "t",
                    assetId: "a",
                    tileX: 2,
                    tileY: 8,
                },
                PLACED
            )
        ).toEqual([2, 8]);
        expect(
            getOpFocusCell(
                { type: "move_asset", id: "obj-1", tileX: 4, tileY: 5 },
                PLACED
            )
        ).toEqual([4, 5]);
    });

    it("finds an object already in the map by its id", () => {
        expect(
            getOpFocusCell({ type: "remove_asset", id: "obj-1" }, PLACED)
        ).toEqual([7, 9]);
        expect(
            getOpFocusCell(
                { type: "replace_asset", id: "obj-1", assetId: "a" },
                PLACED
            )
        ).toEqual([7, 9]);
        expect(
            getOpFocusCell({ type: "remove_asset", id: "gone" }, PLACED)
        ).toBeNull();
    });

    it("goes to the corner of a zone", () => {
        expect(
            getOpFocusCell(
                {
                    type: "set_zone",
                    zone: { kind: "area", rect: { x: 1, y: 2, w: 3, h: 4 } },
                },
                PLACED
            )
        ).toEqual([1, 2]);
    });

    it("has no cell for the background, a removed zone or a missing operation", () => {
        expect(
            getOpFocusCell({ type: "set_background", color: "#000000" }, PLACED)
        ).toBeNull();
        expect(
            getOpFocusCell({ type: "remove_zone", zoneId: 1 }, PLACED)
        ).toBeNull();
        expect(getOpFocusCell(undefined, PLACED)).toBeNull();
    });
});

describe("describePublishIssue", () => {
    const issue: PublishIssue = {
        opIndex: 0,
        code: "CELL_OUT_OF_BOUNDS",
        path: "cells.0",
        message: "Célula fora do mapa",
    };

    it("says the operation, the cell and the reason", () => {
        const op: EditorOp = {
            type: "paint",
            layer: "ground",
            tilesetId: "t",
            tileIndex: 0,
            cells: [[40, 2]],
        };
        expect(describePublishIssue(issue, op, [40, 2])).toBe(
            "Pintura em chão na célula (40, 2): Célula fora do mapa"
        );
    });

    it("names a paint_tiles by its layer", () => {
        const op: EditorOp = {
            type: "paint_tiles",
            layer: "ground",
            tiles: [{ tilesetId: "t", tileIndex: 0, cells: [[6, 7]] }],
        };
        expect(describePublishIssue(issue, op, [6, 7])).toBe(
            "Área colocada em chão na célula (6, 7): Célula fora do mapa"
        );
    });

    it("leaves the cell out when there is none", () => {
        expect(
            describePublishIssue(
                issue,
                { type: "set_background", color: "#000000" },
                null
            )
        ).toBe("Cor de fundo: Célula fora do mapa");
        expect(describePublishIssue(issue, undefined, null)).toBe(
            "Alteração: Célula fora do mapa"
        );
    });
});

describe("getPublishIssueRows", () => {
    it("pairs each error with the operation at its index", () => {
        const ops: EditorOp[] = [
            { type: "set_background", color: "#000000" },
            { type: "move_asset", id: "obj-1", tileX: 4, tileY: 5 },
        ];
        const model = { placed: PLACED } as EditorModel;
        const rows = getPublishIssueRows(
            [
                {
                    opIndex: 1,
                    code: "FOOTPRINT_OVERLAP",
                    path: "",
                    message: "Ocupado",
                },
                { opIndex: 9, code: "X", path: "", message: "Sem operação" },
            ],
            ops,
            model
        );

        expect(rows).toHaveLength(2);
        expect(rows[0].cell).toEqual([4, 5]);
        expect(rows[0].text).toBe("Objeto movido na célula (4, 5): Ocupado");
        expect(rows[1].cell).toBeNull();
        expect(rows[0].key).not.toBe(rows[1].key);
    });
});
