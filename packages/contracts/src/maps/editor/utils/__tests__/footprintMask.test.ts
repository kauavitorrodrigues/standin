import { describe, expect, it } from "vitest";
import { SOLID_MASK_SUBDIVISION } from "../../../../assets/consts/library";
import { expandTileMask } from "../../../../assets/utils/footprintMask";
import type { AssetDefinition } from "../../../../assets/types";
import type { LibraryPalette } from "../../../../assets/types/library";
import { buildLayout, library } from "../../../layout/__tests__/fixtures";
import { LAYOUT_ISSUE_CODES as Code } from "../../../layout/issues";
import { findTileLayer } from "../../../layout/ops/findTileLayer";
import type { PlacedAsset } from "../../../render/render-payload.schema";
import type { EditorModel } from "../../types/editor-model";
import { canPlaceAsset } from "../canPlaceAsset";
import { canReplaceAsset } from "../canReplaceAsset";
import { cellsInside, cellsOverlap } from "../cellsOverlap";
import { getOccupiedCells } from "../getOccupiedCells";
import { getOccupiedFineCells } from "../getOccupiedFineCells";
import { occupiedCells } from "../occupiedCells";

// The top arm and the left arm are occupied, the inside of the L is free. The
// mask is written by tile and goes in as the cells a tile stands for.
const L_MASK = expandTileMask([
    [true, true, true],
    [true, false, false],
    [true, false, false],
]) as boolean[][];

const S = SOLID_MASK_SUBDIVISION;

// A mask of w x h tiles with only the cells where `occupied` is true.
const cellsMask = (
    w: number,
    h: number,
    occupied: (column: number, row: number) => boolean
): boolean[][] =>
    Array.from({ length: h * S }, (_, row) =>
        Array.from({ length: w * S }, (_, column) => occupied(column, row))
    );

// Occupies the left half of its only tile.
const leftHalf = cellsMask(1, 1, (column) => column < S / 2);

const asset = (overrides: Partial<AssetDefinition>): AssetDefinition =>
    ({
        id: "a",
        type: "DECORATION",
        placement: "GROUND",
        footprint: { w: 1, h: 1, offsetX: 0 },
        ...overrides,
    }) as AssetDefinition;

const corner = asset({
    id: "corner",
    type: "DESK",
    footprint: { w: 3, h: 3, offsetX: 0, mask: L_MASK },
});
const fullDesk = asset({
    id: "full",
    type: "DESK",
    footprint: { w: 3, h: 3, offsetX: 0 },
});
const chair = asset({ id: "chair", type: "CHAIR" });
const leftTable = asset({
    id: "leftTable",
    type: "DESK",
    footprint: { w: 1, h: 1, offsetX: 0, mask: leftHalf },
});
const rightHalf = asset({
    id: "rightHalf",
    type: "CHAIR",
    footprint: {
        w: 1,
        h: 1,
        offsetX: 0,
        mask: cellsMask(1, 1, (column) => column >= S / 2),
    },
});
const vase = asset({ id: "vase", type: "PLANT", placement: "SURFACE" });

const palette = {
    tilesets: Object.values(library.tilesets).map(
        ({ id, tileCount, tileMeta }) => ({ id, tileCount, tileMeta })
    ),
    assets: [corner, fullDesk, chair, vase, leftTable, rightHalf],
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

// The corner desk is anchored at (5, 5), so it spans x 5..7 and y 3..5.
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

describe("getOccupiedCells", () => {
    it("returns every cell of the rectangle without a mask", () => {
        const cells = getOccupiedCells({
            tileX: 5,
            tileY: 5,
            width: 3,
            height: 3,
        });
        expect(cells).toHaveLength(9);
    });

    it("keeps only the cells the mask marks, rows from top to bottom", () => {
        const cells = getOccupiedCells({
            tileX: 5,
            tileY: 5,
            width: 3,
            height: 3,
            mask: L_MASK,
        });
        expect(cells).toHaveLength(5);
        expect(cells).toContainEqual({ x: 5, y: 3 });
        expect(cells).toContainEqual({ x: 7, y: 3 });
        expect(cells).toContainEqual({ x: 5, y: 5 });
        expect(cells).not.toContainEqual({ x: 6, y: 4 });
        expect(cells).not.toContainEqual({ x: 7, y: 5 });
    });

    it("matches the asset level function", () => {
        expect(occupiedCells(corner, 5, 5)).toEqual(
            getOccupiedCells({
                tileX: 5,
                tileY: 5,
                width: 3,
                height: 3,
                mask: L_MASK,
            })
        );
    });
});

describe("getOccupiedFineCells", () => {
    it("returns every cell of every tile without a mask", () => {
        const cells = getOccupiedFineCells({
            tileX: 2,
            tileY: 1,
            width: 2,
            height: 1,
        });
        expect(cells).toHaveLength(2 * S * S);
        expect(cells).toContainEqual({ x: 2 * S, y: S });
        expect(cells).toContainEqual({ x: 4 * S - 1, y: S + S - 1 });
    });

    it("keeps only the cells the mask marks", () => {
        const cells = getOccupiedFineCells({
            tileX: 2,
            tileY: 1,
            width: 1,
            height: 1,
            mask: leftHalf,
        });
        expect(cells).toHaveLength((S * S) / 2);
        expect(cells).toContainEqual({ x: 2 * S, y: S });
        expect(cells).not.toContainEqual({ x: 2 * S + S - 1, y: S });
    });
});

describe("cellsOverlap and cellsInside", () => {
    const a = [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
    ];

    it("detects a shared cell", () => {
        expect(cellsOverlap(a, [{ x: 2, y: 1 }])).toBe(true);
        expect(cellsOverlap(a, [{ x: 3, y: 1 }])).toBe(false);
    });

    it("tells whether every cell is inside the other list", () => {
        expect(cellsInside([{ x: 1, y: 1 }], a)).toBe(true);
        expect(
            cellsInside(
                [
                    { x: 1, y: 1 },
                    { x: 9, y: 9 },
                ],
                a
            )
        ).toBe(false);
    });
});

describe("canPlaceAsset with a footprint mask", () => {
    const model = buildModel([placedAt("p1", "corner", 5, 5)]);

    it("accepts an object inside the free part of the L", () => {
        expect(canPlaceAsset(model, chair, 6, 5)).toEqual({ ok: true });
        expect(canPlaceAsset(model, chair, 7, 4)).toEqual({ ok: true });
    });

    it("refuses an object over the occupied arms", () => {
        const overlap = { ok: false, reason: Code.FOOTPRINT_OVERLAP };
        expect(canPlaceAsset(model, chair, 5, 5)).toEqual(overlap);
        expect(canPlaceAsset(model, chair, 6, 3)).toEqual(overlap);
    });

    it("lets the L sit around an object already in its free part", () => {
        const withChair = buildModel([placedAt("c1", "chair", 6, 5)]);
        expect(canPlaceAsset(withChair, corner, 5, 5)).toEqual({ ok: true });
        expect(canPlaceAsset(withChair, fullDesk, 5, 5)).toEqual({
            ok: false,
            reason: Code.FOOTPRINT_OVERLAP,
        });
    });

    it("accepts a surface item only on an occupied cell of the parent", () => {
        const onArm = canPlaceAsset(model, vase, 5, 4, { parentId: "p1" });
        const onGap = canPlaceAsset(model, vase, 6, 5, { parentId: "p1" });
        expect(onArm).toEqual({ ok: true });
        expect(onGap).toEqual({ ok: false, reason: Code.NOT_ON_SURFACE });
    });

    it("refuses a replacement that leaves a child on a free cell", () => {
        const withChild = buildModel([
            placedAt("p1", "full", 5, 5),
            placedAt("v1", "vase", 6, 5, "p1"),
        ]);
        const result = canReplaceAsset(withChild, withChild.placed[0]!, corner);
        expect(result.ok).toBe(false);
    });
});

describe("canPlaceAsset sharing a tile by cells", () => {
    const model = buildModel([placedAt("t1", "leftTable", 5, 5)]);

    it("accepts an object whose cells fit the free half of the tile", () => {
        expect(canPlaceAsset(model, rightHalf, 5, 5)).toEqual({ ok: true });
    });

    it("refuses an object that reaches the occupied half", () => {
        expect(canPlaceAsset(model, chair, 5, 5)).toEqual({
            ok: false,
            reason: Code.FOOTPRINT_OVERLAP,
        });
        expect(canPlaceAsset(model, leftTable, 5, 5)).toEqual({
            ok: false,
            reason: Code.FOOTPRINT_OVERLAP,
        });
    });

    it("still counts the whole tile for a wall painted under it", () => {
        expect(
            getOccupiedCells({
                tileX: 5,
                tileY: 5,
                width: 1,
                height: 1,
                mask: leftHalf,
            })
        ).toEqual([{ x: 5, y: 5 }]);
    });
});
