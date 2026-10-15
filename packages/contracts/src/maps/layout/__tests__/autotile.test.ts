import { describe, expect, it } from "vitest";
import { WALL_PIECES } from "../../../assets/enums/wall-edge";
import type { WallPiece } from "../../../assets/enums/wall-edge";
import { applyOp } from "../applyOp";
import { LAYOUT_ISSUE_CODES as Code } from "../issues";
import { applyOps } from "../applyOps";
import { cellKey } from "../readWallCells";
import { pickWallPiece, WALL_SHAPE_REASONS } from "../ops/pickWallPiece";
import { generateBlankLayout } from "../generateBlankLayout";
import { defaults } from "./fixtures";
import {
    FACADES,
    PIECE_ORDER,
    THIN_ID,
    TOP_INDEX,
    buildLibrary,
    buildMeta,
} from "./thinWallKit";
import type { MapLayout } from "../../schemas/layout.schema";

const library = buildLibrary();
const blank = (): MapLayout =>
    generateBlankLayout("XS", { floor: defaults.floor });

const paint = (layout: MapLayout, cells: [number, number][], lib = library) =>
    applyOp(
        layout,
        {
            type: "paint",
            layer: "walls",
            tilesetId: THIN_ID,
            tileIndex: 4,
            cells,
        },
        lib
    );

const erase = (layout: MapLayout, cells: [number, number][]) =>
    applyOp(layout, { type: "erase", layer: "walls", cells }, library);

const layer = (layout: MapLayout, name: string) => {
    const found = layout.layers.find((item) => item.name === name);
    if (found?.type !== "tilelayer") throw new Error(name);
    return found;
};

const firstgid = (layout: MapLayout) =>
    layout.tilesets.find(({ name }) => name === THIN_ID)?.firstgid ?? 0;

// The piece on a cell, or null when it is empty.
const pieceAt = (layout: MapLayout, x: number, y: number): WallPiece | null => {
    const gid = layer(layout, "walls").data[y * layout.width + x];
    if (gid === 0) return null;
    return PIECE_ORDER[gid - firstgid(layout)] ?? null;
};

const rectangle = (
    left: number,
    top: number,
    right: number,
    bottom: number
): [number, number][] => {
    const cells: [number, number][] = [];
    for (let x = left; x <= right; x++) {
        for (let y = top; y <= bottom; y++) {
            if (x === left || x === right || y === top || y === bottom) {
                cells.push([x, y]);
            }
        }
    }
    return cells;
};

const set = (...cells: [number, number][]) =>
    new Set(cells.map(([x, y]) => cellKey(x, y)));

describe("pickWallPiece", () => {
    it("takes a single cell as a right wall", () => {
        expect(pickWallPiece(set([3, 3]), 3, 3)).toEqual({
            ok: true,
            piece: "e",
        });
    });

    it.each([
        ["a row alone is a front wall", set([2, 2], [3, 2], [4, 2]), "s"],
        ["a column alone is a right wall", set([2, 2], [2, 3], [2, 4]), "e"],
    ])("%s", (_name, cells, piece) => {
        expect(pickWallPiece(cells, 2, 3 - (piece === "s" ? 1 : 0))).toEqual({
            ok: true,
            piece,
        });
    });

    it("picks the four corners from the sides the walls go to", () => {
        const cross = (corner: [number, number]) =>
            pickWallPiece(
                set(
                    corner,
                    [corner[0] + 1, corner[1]],
                    [corner[0], corner[1] + 1]
                ),
                corner[0],
                corner[1]
            );
        expect(cross([5, 5])).toEqual({ ok: true, piece: "nw" });
        expect(pickWallPiece(set([5, 5], [4, 5], [5, 6]), 5, 5)).toEqual({
            ok: true,
            piece: "ne",
        });
        expect(pickWallPiece(set([5, 5], [6, 5], [5, 4]), 5, 5)).toEqual({
            ok: true,
            piece: "sw",
        });
        expect(pickWallPiece(set([5, 5], [4, 5], [5, 4]), 5, 5)).toEqual({
            ok: true,
            piece: "se",
        });
    });

    it("tells the back wall from the front wall of an outline", () => {
        const cells = new Set(
            rectangle(2, 2, 6, 5).map(([x, y]) => cellKey(x, y))
        );
        expect(pickWallPiece(cells, 4, 2)).toEqual({ ok: true, piece: "n" });
        expect(pickWallPiece(cells, 4, 5)).toEqual({ ok: true, piece: "s" });
        expect(pickWallPiece(cells, 2, 3)).toEqual({ ok: true, piece: "w" });
        expect(pickWallPiece(cells, 6, 3)).toEqual({ ok: true, piece: "e" });
    });

    it("refuses a junction and a cross", () => {
        const tee = set([4, 4], [3, 4], [5, 4], [4, 5]);
        expect(pickWallPiece(tee, 4, 4)).toEqual({
            ok: false,
            reason: WALL_SHAPE_REASONS.JUNCTION,
        });
        const plus = set([4, 4], [3, 4], [5, 4], [4, 5], [4, 3]);
        expect(pickWallPiece(plus, 4, 4)).toEqual({
            ok: false,
            reason: WALL_SHAPE_REASONS.JUNCTION,
        });
    });

    it("refuses the run of an inner corner, whose ends turn to opposite sides", () => {
        // An L shaped outline: the row at y 4 turns up on the right and down
        // on the left.
        const cells = new Set(
            [
                [2, 2],
                [3, 2],
                [4, 2],
                [4, 3],
                [4, 4],
                [3, 4],
                [2, 4],
                [2, 3],
            ].map(([x, y]) => cellKey(x, y))
        );
        expect(pickWallPiece(cells, 3, 2).ok).toBe(true);
        const l = new Set(
            [
                [0, 0],
                [1, 0],
                [2, 0],
                [2, 1],
                [2, 2],
                [3, 2],
                [4, 2],
                [4, 3],
                [4, 4],
                [3, 4],
                [2, 4],
                [1, 4],
                [0, 4],
                [0, 3],
                [0, 2],
                [0, 1],
            ].map(([x, y]) => cellKey(x, y))
        );
        expect(pickWallPiece(l, 3, 2)).toEqual({
            ok: false,
            reason: WALL_SHAPE_REASONS.MIXED_RUN,
        });
    });
});

describe("painting walls of a style", () => {
    it("draws a rectangle with the eight pieces of a style", () => {
        const { layout, errors } = paint(blank(), rectangle(3, 3, 7, 6));

        expect(errors).toEqual([]);
        expect(pieceAt(layout, 3, 3)).toBe("nw");
        expect(pieceAt(layout, 5, 3)).toBe("n");
        expect(pieceAt(layout, 7, 3)).toBe("ne");
        expect(pieceAt(layout, 3, 4)).toBe("w");
        expect(pieceAt(layout, 7, 5)).toBe("e");
        expect(pieceAt(layout, 3, 6)).toBe("sw");
        expect(pieceAt(layout, 5, 6)).toBe("s");
        expect(pieceAt(layout, 7, 6)).toBe("se");
    });

    it("writes the top of a facade on the foreground row above", () => {
        const { layout } = paint(blank(), rectangle(3, 3, 7, 6));
        const foreground = layer(layout, "foreground");
        const top = firstgid(layout) + TOP_INDEX;

        expect(foreground.data[2 * layout.width + 5]).toBe(top);
        expect(foreground.data[5 * layout.width + 5]).toBe(top);
        // A side wall has no top.
        expect(foreground.data[3 * layout.width + 3]).toBe(0);
    });

    it("changes the piece of a whole row when the run turns", () => {
        const row: [number, number][] = [
            [3, 3],
            [4, 3],
            [5, 3],
        ];
        const line = paint(blank(), row).layout;
        expect(pieceAt(line, 4, 3)).toBe("s");

        const turned = paint(line, [[3, 4]]).layout;
        expect(pieceAt(turned, 3, 3)).toBe("nw");
        expect(pieceAt(turned, 4, 3)).toBe("n");
        expect(pieceAt(turned, 5, 3)).toBe("n");
    });

    it("refuses a junction with a message and leaves the layout alone", () => {
        const base = paint(blank(), [
            [3, 3],
            [4, 3],
            [5, 3],
        ]).layout;
        const result = paint(base, [[4, 4]]);

        expect(result.errors.map(({ code }) => code)).toEqual([
            Code.WALL_SHAPE_UNSUPPORTED,
        ]);
        expect(result.layout).toBe(base);
    });

    it("refuses when the style lacks a piece the shape needs", () => {
        const incomplete = buildLibrary([WALL_PIECES.NE]);
        const result = paint(blank(), rectangle(3, 3, 7, 6), incomplete);

        expect(result.errors.map(({ code }) => code)).toEqual([
            Code.WALL_STYLE_INCOMPLETE,
        ]);
    });

    it("does not rewrite a wall of another style next to it", () => {
        const other = buildLibrary();
        other.tilesets["tileset-grey"] = {
            id: "tileset-grey",
            organizationId: null,
            tileCount: 9,
            tileMeta: buildMeta("Cinza"),
        };
        const grey = applyOp(
            blank(),
            {
                type: "paint",
                layer: "walls",
                tilesetId: "tileset-grey",
                tileIndex: 2,
                cells: [[5, 4]],
            },
            other
        ).layout;
        const next = paint(
            grey,
            [
                [5, 3],
                [5, 5],
            ],
            other
        ).layout;

        const greyFirstgid =
            next.tilesets.find(({ name }) => name === "tileset-grey")
                ?.firstgid ?? 0;
        expect(layer(next, "walls").data[4 * next.width + 5]).toBe(
            greyFirstgid + 2
        );
    });
});

describe("erasing walls of a style", () => {
    it("takes the top away and turns the next cell into the end of its run", () => {
        const drawn = paint(blank(), rectangle(3, 3, 7, 6)).layout;
        const erased = erase(drawn, [[5, 3]]).layout;

        expect(pieceAt(erased, 5, 3)).toBeNull();
        expect(layer(erased, "foreground").data[2 * erased.width + 5]).toBe(0);
        expect(pieceAt(erased, 4, 3)).toBe("n");
        expect(pieceAt(erased, 6, 3)).toBe("n");
    });

    it("turns the rest of a rectangle back into plain lines when a side goes", () => {
        const drawn = paint(blank(), rectangle(3, 3, 7, 6)).layout;
        const erased = erase(drawn, [
            [3, 6],
            [4, 6],
            [5, 6],
            [6, 6],
            [7, 6],
        ]).layout;

        expect(pieceAt(erased, 3, 5)).toBe("w");
        expect(pieceAt(erased, 7, 5)).toBe("e");
        expect(pieceAt(erased, 5, 3)).toBe("n");
    });
});

describe("undo of wall changes", () => {
    it("replays the inverse of a paint and an erase back to the start", () => {
        const start = paint(blank(), rectangle(3, 3, 7, 6)).layout;
        const cut = erase(start, [
            [5, 3],
            [6, 3],
        ]).layout;
        const walls = (layout: MapLayout) =>
            layer(layout, "walls").data.join(",");
        const foreground = (layout: MapLayout) =>
            layer(layout, "foreground").data.join(",");

        // Painting the pieces back one gid at a time, as an undo does.
        const restored = applyOps(
            cut,
            [
                {
                    type: "paint",
                    layer: "walls",
                    tilesetId: THIN_ID,
                    tileIndex: 0,
                    cells: [
                        [5, 3],
                        [6, 3],
                    ],
                },
            ],
            library
        ).layout;

        expect(walls(restored)).toBe(walls(start));
        expect(foreground(restored)).toBe(foreground(start));
    });
});
