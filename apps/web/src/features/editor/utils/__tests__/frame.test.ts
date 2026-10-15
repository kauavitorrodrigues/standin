import { describe, expect, it } from "vitest";
import {
    TILE_SIZE,
    buildBlankEditorModel,
    type AssetDefinition,
    type LibraryPalette,
} from "@standin/contracts";
import { findCrossingObjectIds } from "@/features/editor/utils/findCrossingObjectIds";
import { hitTestFrame } from "@/features/editor/utils/hitTestFrame";
import { moveFrameRect } from "@/features/editor/utils/moveFrameRect";
import { resizeFrameRect } from "@/features/editor/utils/resizeFrameRect";
import { clampCell } from "@/features/editor/utils/clampCell";
import type { FrameLimits } from "@/features/editor/types/frame-limits";

const COLUMNS = 40;
const ROWS = 30;
const LIMITS: FrameLimits = { minSize: 2, maxWidth: 40, maxHeight: 30 };
const rect = { x: 0, y: 0, w: 12, h: 8 };

describe("resizeFrameRect", () => {
    it("snaps the east edge to the far side of the cell", () => {
        const result = resizeFrameRect({
            rect,
            handle: "e",
            cell: [19, 3],
            columns: COLUMNS,
            rows: ROWS,
            limits: LIMITS,
        });
        expect(result).toEqual({ x: 0, y: 0, w: 20, h: 8 });
    });

    it("moves two edges at once on a corner", () => {
        const result = resizeFrameRect({
            rect,
            handle: "se",
            cell: [5, 3],
            columns: COLUMNS,
            rows: ROWS,
            limits: LIMITS,
        });
        expect(result).toEqual({ x: 0, y: 0, w: 6, h: 4 });
    });

    it("stops at the minimum size", () => {
        const result = resizeFrameRect({
            rect: { x: 4, y: 4, w: 6, h: 6 },
            handle: "nw",
            cell: [20, 20],
            columns: COLUMNS,
            rows: ROWS,
            limits: LIMITS,
        });
        expect(result).toEqual({ x: 8, y: 8, w: 2, h: 2 });
    });

    it("stops at the maximum size", () => {
        const result = resizeFrameRect({
            rect: { x: 10, y: 10, w: 10, h: 10 },
            handle: "se",
            cell: [39, 29],
            columns: COLUMNS,
            rows: ROWS,
            limits: { minSize: 2, maxWidth: 20, maxHeight: 12 },
        });
        expect(result).toEqual({ x: 10, y: 10, w: 20, h: 12 });
    });

    it("never leaves the canvas on the west or north edge", () => {
        const result = resizeFrameRect({
            rect: { x: 3, y: 2, w: 6, h: 6 },
            handle: "nw",
            cell: [0, 0],
            columns: COLUMNS,
            rows: ROWS,
            limits: LIMITS,
        });
        expect(result).toEqual({ x: 0, y: 0, w: 9, h: 8 });
    });

    it("keeps the other edges still on a side handle", () => {
        const result = resizeFrameRect({
            rect: { x: 5, y: 5, w: 6, h: 6 },
            handle: "s",
            cell: [0, 12],
            columns: COLUMNS,
            rows: ROWS,
            limits: LIMITS,
        });
        expect(result).toEqual({ x: 5, y: 5, w: 6, h: 8 });
    });
});

describe("moveFrameRect", () => {
    it("moves by the whole tiles the pointer went", () => {
        const result = moveFrameRect({
            rect,
            from: [2, 2],
            cell: [7, 5],
            columns: COLUMNS,
            rows: ROWS,
        });
        expect(result).toEqual({ x: 5, y: 3, w: 12, h: 8 });
    });

    it("keeps the size and stops at the canvas border", () => {
        const result = moveFrameRect({
            rect: { x: 20, y: 10, w: 12, h: 8 },
            from: [21, 11],
            cell: [39, 29],
            columns: COLUMNS,
            rows: ROWS,
        });
        expect(result).toEqual({ x: 28, y: 22, w: 12, h: 8 });
    });

    it("does not go below the origin", () => {
        const result = moveFrameRect({
            rect: { x: 2, y: 2, w: 4, h: 4 },
            from: [3, 3],
            cell: [0, 0],
            columns: COLUMNS,
            rows: ROWS,
        });
        expect(result).toEqual({ x: 0, y: 0, w: 4, h: 4 });
    });
});

describe("clampCell", () => {
    it("pulls a point outside the canvas to the nearest cell", () => {
        expect(clampCell(-50, 99999, COLUMNS, ROWS)).toEqual([0, ROWS - 1]);
    });

    it("keeps the cell of a point inside", () => {
        expect(
            clampCell(3 * TILE_SIZE + 1, 4 * TILE_SIZE, COLUMNS, ROWS)
        ).toEqual([3, 4]);
    });
});

describe("hitTestFrame", () => {
    const frame = { x: 2, y: 2, w: 10, h: 6 };
    const left = 2 * TILE_SIZE;
    const top = 2 * TILE_SIZE;
    const right = 12 * TILE_SIZE;
    const bottom = 8 * TILE_SIZE;
    const hit = (worldX: number, worldY: number, zoom = 1, body = false) =>
        hitTestFrame({ rect: frame, worldX, worldY, zoom, body });

    it("grabs a corner", () => {
        expect(hit(right, bottom)).toBe("se");
        expect(hit(left + 2, bottom - 2)).toBe("sw");
    });

    it("grabs the whole length of an edge, not only the middle", () => {
        expect(hit(left + 50, top)).toBe("n");
        expect(hit(right - 2, top + 70)).toBe("e");
        expect(hit(left + 100, bottom + 3)).toBe("s");
        expect(hit(left, top + 40)).toBe("w");
    });

    it("grabs the inside to move only when the body is on", () => {
        expect(hit(left + 100, top + 100, 1, true)).toBe("move");
        expect(hit(left + 100, top + 100, 1, false)).toBeNull();
    });

    it("grabs nothing far outside, even with the body on", () => {
        expect(hit(0, 0, 1, true)).toBeNull();
    });

    it("keeps the reach on the screen when the camera zooms", () => {
        const farFromEdge = right - 12;
        expect(hit(farFromEdge, top + 70, 1)).toBeNull();
        expect(hit(farFromEdge, top + 70, 0.5)).toBe("e");
    });
});

describe("findCrossingObjectIds", () => {
    const table = {
        id: "table",
        type: "TABLE",
        placement: "GROUND",
        footprint: { w: 2, h: 1, offsetX: 0 },
    } as AssetDefinition;
    const library = {
        tilesets: [],
        assets: [table],
        categories: [],
        areas: [],
    } as LibraryPalette;

    const modelWith = (tiles: [number, number][]) => {
        const model = buildBlankEditorModel({ width: 40, height: 30, library });
        model.placed = tiles.map(([tileX, tileY], index) => ({
            id: `o${index}`,
            assetId: "table",
            tileX,
            tileY,
            offsetX: 0,
            offsetY: 0,
            parentId: null,
            propertyOverrides: null,
        }));
        return model;
    };

    it("flags an object the border cuts", () => {
        const model = modelWith([[11, 3]]);
        expect(findCrossingObjectIds(model, rect)).toEqual(["o0"]);
    });

    it("ignores objects wholly inside or wholly outside", () => {
        const model = modelWith([
            [3, 3],
            [20, 3],
        ]);
        expect(findCrossingObjectIds(model, rect)).toEqual([]);
    });

    it("stops flagging once the frame grows over the object", () => {
        const model = modelWith([[11, 3]]);
        const grown = { x: 0, y: 0, w: 14, h: 8 };
        expect(findCrossingObjectIds(model, grown)).toEqual([]);
    });
});
