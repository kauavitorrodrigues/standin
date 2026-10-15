import { describe, expect, it } from "vitest";
import { rectCells } from "../rectCells";
import { rectOutlineCells } from "../rectOutlineCells";
import { lineCells } from "../lineCells";
import { floodFill } from "../floodFill";
import { cellToWorld } from "../cellToWorld";
import { worldToCell } from "../worldToCell";
import { chunkCells } from "../chunkCells";
import { TILE_SIZE } from "../../../consts/constants";
import { buildLayout } from "../../../layout/__tests__/fixtures";
import { findTileLayer } from "../../../layout/ops/findTileLayer";
import type { Cell } from "../../types/cell";

describe("rectOutlineCells", () => {
    it("leaves the middle empty", () => {
        const cells = rectOutlineCells([0, 0], [3, 3]);

        expect(cells).toHaveLength(12);
        expect(cells).not.toContainEqual([1, 1]);
        expect(cells).not.toContainEqual([2, 2]);
    });

    it("accepts inverted corners", () => {
        expect(rectOutlineCells([3, 3], [0, 0])).toEqual(
            rectOutlineCells([0, 0], [3, 3])
        );
    });

    it("keeps every cell of a rectangle with no middle", () => {
        expect(rectOutlineCells([0, 0], [1, 1])).toEqual(
            rectCells([0, 0], [1, 1])
        );
        expect(rectOutlineCells([0, 0], [4, 0])).toEqual(
            rectCells([0, 0], [4, 0])
        );
    });

    it("returns one cell when corners are equal", () => {
        expect(rectOutlineCells([3, 4], [3, 4])).toEqual([[3, 4]]);
    });
});

describe("rectCells", () => {
    it("orders cells by y and then x", () => {
        expect(rectCells([0, 0], [1, 1])).toEqual([
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
        ]);
    });

    it("accepts inverted corners", () => {
        expect(rectCells([2, 2], [1, 1])).toEqual(rectCells([1, 1], [2, 2]));
    });

    it("returns one cell when corners are equal", () => {
        expect(rectCells([3, 4], [3, 4])).toEqual([[3, 4]]);
    });
});

describe("lineCells", () => {
    it("covers a horizontal line", () => {
        expect(lineCells([0, 2], [3, 2])).toEqual([
            [0, 2],
            [1, 2],
            [2, 2],
            [3, 2],
        ]);
    });

    it("covers a diagonal with no gaps", () => {
        const cells = lineCells([0, 0], [4, 4]);
        expect(cells).toEqual([
            [0, 0],
            [1, 1],
            [2, 2],
            [3, 3],
            [4, 4],
        ]);
    });

    it("has consecutive cells always adjacent, in reverse too", () => {
        const cells = lineCells([6, 1], [0, 4]);
        expect(cells[0]).toEqual([6, 1]);
        expect(cells[cells.length - 1]).toEqual([0, 4]);
        for (let i = 1; i < cells.length; i++) {
            expect(Math.abs(cells[i][0] - cells[i - 1][0])).toBeLessThanOrEqual(
                1
            );
            expect(Math.abs(cells[i][1] - cells[i - 1][1])).toBeLessThanOrEqual(
                1
            );
        }
    });

    it("returns one cell for a point", () => {
        expect(lineCells([1, 1], [1, 1])).toEqual([[1, 1]]);
    });
});

describe("floodFill", () => {
    const setGid = (layer: "ground", cells: Cell[], gid: number) => {
        const layout = buildLayout();
        const target = findTileLayer(layout, layer)!;
        const base = target.data[0];
        for (const [x, y] of cells) {
            target.data[y * layout.width + x] = gid;
        }
        return { layout, base };
    };

    it("fills the whole map when the layer is uniform", () => {
        const layout = buildLayout();
        expect(floodFill(layout, "ground", [0, 0])).toHaveLength(
            layout.width * layout.height
        );
    });

    it("stays inside the rectangle it is given", () => {
        const layout = buildLayout();
        const within = { x: 1, y: 1, w: 3, h: 2 };

        expect(floodFill(layout, "ground", [2, 1], within)).toEqual(
            rectCells([1, 1], [3, 2])
        );
        expect(floodFill(layout, "ground", [0, 0], within)).toEqual([]);
    });

    it("fills only a region of a different gid", () => {
        const { layout } = setGid("ground", rectCells([1, 1], [2, 2]), 99);
        expect(floodFill(layout, "ground", [1, 1])).toEqual(
            rectCells([1, 1], [2, 2])
        );
    });

    it("stops at a surrounding region", () => {
        const ring = [
            ...rectCells([0, 0], [4, 0]),
            ...rectCells([0, 4], [4, 4]),
            ...rectCells([0, 1], [0, 3]),
            ...rectCells([4, 1], [4, 3]),
        ];
        const { layout } = setGid("ground", ring, 99);
        expect(floodFill(layout, "ground", [2, 2])).toEqual(
            rectCells([1, 1], [3, 3])
        );
    });

    it("includes cells on the map borders", () => {
        const { layout } = setGid("ground", [[0, 0]], 99);
        const region = floodFill(layout, "ground", [1, 0]);
        expect(region).toHaveLength(layout.width * layout.height - 1);
        expect(region).toContainEqual([layout.width - 1, layout.height - 1]);
    });

    it("starts from an empty cell", () => {
        const layout = buildLayout();
        const region = floodFill(layout, "foreground", [3, 3]);
        expect(region.length).toBeGreaterThan(0);
        expect(region).toContainEqual([3, 3]);
    });

    it("returns nothing outside the map", () => {
        const layout = buildLayout();
        expect(floodFill(layout, "ground", [-1, 0])).toEqual([]);
        expect(floodFill(layout, "ground", [layout.width, 0])).toEqual([]);
    });

    it("returns nothing when the layer does not exist", () => {
        const layout = buildLayout();
        layout.layers = layout.layers.filter(({ name }) => name !== "ground");
        expect(floodFill(layout, "ground", [0, 0])).toEqual([]);
    });
});

describe("cellToWorld and worldToCell", () => {
    it("converts a cell to its top left pixel", () => {
        expect(cellToWorld(2, 3)).toEqual([2 * TILE_SIZE, 3 * TILE_SIZE]);
    });

    it("round trips cells", () => {
        const [px, py] = cellToWorld(5, 7);
        expect(worldToCell(px, py)).toEqual([5, 7]);
    });

    it("uses floor inside a cell and for negatives", () => {
        expect(worldToCell(TILE_SIZE - 1, TILE_SIZE + 1)).toEqual([0, 1]);
        expect(worldToCell(-1, -1)).toEqual([-1, -1]);
    });
});

describe("chunkCells", () => {
    const build = (count: number): Cell[] =>
        Array.from({ length: count }, (_, i) => [i, 0]);

    it("splits 2501 cells into two blocks by default", () => {
        const chunks = chunkCells(build(2501));
        expect(chunks.map((chunk) => chunk.length)).toEqual([2500, 1]);
    });

    it("keeps a short list in one block", () => {
        expect(chunkCells(build(3))).toHaveLength(1);
    });

    it("honors a custom size", () => {
        expect(chunkCells(build(5), 2).map((c) => c.length)).toEqual([2, 2, 1]);
    });

    it("returns no blocks for an empty list", () => {
        expect(chunkCells([])).toEqual([]);
    });
});
