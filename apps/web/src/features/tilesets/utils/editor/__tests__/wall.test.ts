import { describe, expect, it } from "vitest";
import {
    TILE_CATEGORIES,
    WALL_PIECE_EDGES,
    WALL_PIECES,
    type TileMeta,
} from "@standin/contracts";
import { setTileCategory } from "../metaEdit";
import { getOverlapFromPointer } from "../wall/getOverlapFromPointer";
import { getWallCellFromPointer } from "../wall/getWallCellFromPointer";
import { getWallIssues } from "../wall/getWallIssues";
import {
    clearWallCollision,
    paintWallCollision,
    resolveWallCollision,
} from "../wall/paintWallCollision";
import { setWallOverlap } from "../wall/setWallOverlap";
import { setWallPiece } from "../wall/setWallPiece";
import { setWallStyle } from "../wall/setWallStyle";

const allowAll = () => true;
const allowNone = () => false;

const walls = (): TileMeta => ({
    "0": { category: TILE_CATEGORIES.WALL },
    "1": { category: TILE_CATEGORIES.WALL },
    "2": { category: TILE_CATEGORIES.FLOOR },
});

describe("setWallPiece", () => {
    it("gives the edges of the piece and joins the fallback style", () => {
        const next = setWallPiece(
            walls(),
            [0],
            WALL_PIECES.NE,
            allowAll,
            "Azul"
        );
        expect(next["0"]).toEqual({
            category: "WALL",
            style: "Azul",
            edges: [...WALL_PIECE_EDGES.ne],
        });
    });

    it("keeps the style the tile already has", () => {
        const meta: TileMeta = {
            "0": { category: "WALL", style: "Cinza" },
        };
        const next = setWallPiece(meta, [0], WALL_PIECES.S, allowAll, "Azul");
        expect(next["0"].style).toBe("Cinza");
    });

    it("takes the edges away and keeps the style when the piece is null", () => {
        const placed = setWallPiece(walls(), [0], WALL_PIECES.E, allowAll, "A");
        const next = setWallPiece(placed, [0], null, allowAll);
        expect(next["0"]).toEqual({ category: "WALL", style: "A" });
    });

    it("gives every selected wall the piece", () => {
        const next = setWallPiece(
            walls(),
            [0, 1],
            WALL_PIECES.W,
            allowAll,
            "A"
        );
        expect(next["0"].edges).toEqual(["W"]);
        expect(next["1"].edges).toEqual(["W"]);
    });

    it("leaves alone a tile that is not a wall or cannot be edited", () => {
        const meta = walls();
        expect(setWallPiece(meta, [2], WALL_PIECES.N, allowAll)).toBe(meta);
        expect(setWallPiece(meta, [0], WALL_PIECES.N, allowNone)).toBe(meta);
        expect(setWallPiece(meta, [9], WALL_PIECES.N, allowAll)).toBe(meta);
    });
});

describe("setWallStyle", () => {
    it("names the style and trims it", () => {
        const next = setWallStyle(walls(), [0], "  Tijolo ", allowAll);
        expect(next["0"].style).toBe("Tijolo");
    });

    it("cuts a name past the limit", () => {
        const next = setWallStyle(walls(), [0], "x".repeat(60), allowAll);
        expect(next["0"].style).toHaveLength(40);
    });

    it("a blank name takes the style and the edges away", () => {
        const placed = setWallPiece(walls(), [0], WALL_PIECES.N, allowAll, "A");
        const next = setWallStyle(placed, [0], "   ", allowAll);
        expect(next["0"]).toEqual({ category: "WALL" });
    });

    it("keeps the edges when the style is renamed", () => {
        const placed = setWallPiece(walls(), [0], WALL_PIECES.N, allowAll, "A");
        const next = setWallStyle(placed, [0], "B", allowAll);
        expect(next["0"]).toEqual({
            category: "WALL",
            style: "B",
            edges: ["N"],
        });
    });

    it("ignores a tile that cannot be edited", () => {
        const meta = walls();
        expect(setWallStyle(meta, [0], "A", allowNone)).toBe(meta);
    });
});

describe("setWallOverlap", () => {
    it("sets the rows and keeps them inside the tile", () => {
        expect(setWallOverlap(walls(), [0], 12, allowAll)["0"].overlap).toBe(
            12
        );
        expect(setWallOverlap(walls(), [0], 99, allowAll)["0"].overlap).toBe(
            32
        );
        expect(setWallOverlap(walls(), [0], -4, allowAll)["0"].overlap).toBe(0);
    });

    it("takes the overlap away with null", () => {
        const set = setWallOverlap(walls(), [0], 8, allowAll);
        expect(setWallOverlap(set, [0], null, allowAll)["0"]).toEqual({
            category: "WALL",
        });
    });

    it("leaves a floor and a locked tile alone", () => {
        const meta = walls();
        expect(setWallOverlap(meta, [2], 4, allowAll)).toBe(meta);
        expect(setWallOverlap(meta, [0], 4, allowNone)).toBe(meta);
    });
});

describe("paintWallCollision", () => {
    const right = [0, 1, 2, 3].map((row) => ({ col: 3, row }));
    const erase = [0, 1, 2].flatMap((col) =>
        [0, 1, 2, 3].map((row) => ({ col, row }))
    );

    it("a tile with no mask blocks the whole tile", () => {
        const mask = resolveWallCollision(walls(), 0);
        expect(mask.flat().every(Boolean)).toBe(true);
    });

    it("erasing the left three columns leaves the right one", () => {
        const next = paintWallCollision(walls(), 0, erase, "erase", allowAll);
        const mask = next["0"].solidMask as boolean[][];
        expect(mask.every((row) => row[3] && !row[0])).toBe(true);
        expect(next["0"].solid).toBe(true);
    });

    it("never erases the last solid cell", () => {
        const narrowed = paintWallCollision(
            walls(),
            0,
            erase,
            "erase",
            allowAll
        );
        const next = paintWallCollision(narrowed, 0, right, "erase", allowAll);
        const mask = next["0"].solidMask as boolean[][];
        expect(mask.flat().filter(Boolean)).toHaveLength(1);
    });

    it("painting every cell back is the same as no mask", () => {
        const narrowed = paintWallCollision(
            walls(),
            0,
            erase,
            "erase",
            allowAll
        );
        const next = paintWallCollision(narrowed, 0, erase, "paint", allowAll);
        expect(next["0"].solidMask).toBeUndefined();
    });

    it("ignores cells outside the grid and returns the same meta", () => {
        const meta = walls();
        const outside = [
            { col: 9, row: 0 },
            { col: -1, row: 2 },
        ];
        expect(paintWallCollision(meta, 0, outside, "erase", allowAll)).toBe(
            meta
        );
    });

    it("leaves a floor and a locked tile alone", () => {
        const meta = walls();
        expect(paintWallCollision(meta, 2, erase, "erase", allowAll)).toBe(
            meta
        );
        expect(paintWallCollision(meta, 0, erase, "erase", allowNone)).toBe(
            meta
        );
    });

    it("clears the mask so the tile blocks whole again", () => {
        const narrowed = paintWallCollision(
            walls(),
            0,
            erase,
            "erase",
            allowAll
        );
        const next = clearWallCollision(narrowed, [0, 1], allowAll);
        expect(next["0"].solidMask).toBeUndefined();
        expect(clearWallCollision(walls(), [0], allowAll)).toEqual(walls());
    });
});

describe("setTileCategory and the wall fields", () => {
    it("drops them when the tile stops being a wall", () => {
        const placed = setWallPiece(walls(), [0], WALL_PIECES.N, allowAll, "A");
        const withMask = paintWallCollision(
            setWallOverlap(placed, [0], 5, allowAll),
            0,
            [{ col: 0, row: 0 }],
            "erase",
            allowAll
        );
        const next = setTileCategory(
            withMask,
            [0],
            TILE_CATEGORIES.FLOOR,
            allowAll
        );
        expect(next["0"]).toEqual({ category: "FLOOR", solid: true });
    });

    it("keeps them when the tile is given the wall category again", () => {
        const placed = setWallPiece(walls(), [0], WALL_PIECES.N, allowAll, "A");
        const next = setTileCategory(
            placed,
            [0],
            TILE_CATEGORIES.WALL,
            allowAll
        );
        expect(next["0"].edges).toEqual(["N"]);
        expect(next["0"].style).toBe("A");
    });

    it("does not touch a tile that cannot be edited", () => {
        const placed = setWallPiece(walls(), [0], WALL_PIECES.N, allowAll, "A");
        const next = setTileCategory(
            placed,
            [0],
            TILE_CATEGORIES.FLOOR,
            allowNone
        );
        expect(next["0"].edges).toEqual(["N"]);
    });
});

describe("getWallIssues", () => {
    const style = (name: string, skip: number[] = []): TileMeta =>
        Object.fromEntries(
            Object.values(WALL_PIECES)
                .map((piece, index) => [index, piece] as const)
                .filter(([index]) => !skip.includes(index))
                .map(([index, piece]) => [
                    String(index),
                    {
                        category: "WALL" as const,
                        style: name,
                        edges: [...WALL_PIECE_EDGES[piece]],
                    },
                ])
        );

    it("has no issue for a complete style or for no style", () => {
        expect(getWallIssues(style("Azul"))).toEqual([]);
        expect(getWallIssues(walls())).toEqual([]);
    });

    it("names the style and the pieces it lacks", () => {
        const issues = getWallIssues(style("Azul", [1, 2]));
        expect(issues).toHaveLength(1);
        expect(issues[0]).toContain('"Azul"');
        expect(issues[0]).toContain("Nordeste");
        expect(issues[0]).toContain("Leste");
    });

    it("lists each incomplete style on its own line", () => {
        const shifted: TileMeta = {};
        Object.entries(style("Cinza", [3])).forEach(([key, entry]) => {
            shifted[String(Number(key) + 20)] = entry;
        });
        const issues = getWallIssues({ ...style("Azul", [0]), ...shifted });
        expect(issues).toHaveLength(2);
    });
});

describe("pointer helpers", () => {
    it("reads the overlap from the height of the pointer in the tile", () => {
        expect(getOverlapFromPointer(0, 192)).toBe(0);
        expect(getOverlapFromPointer(96, 192)).toBe(16);
        expect(getOverlapFromPointer(192, 192)).toBe(32);
        expect(getOverlapFromPointer(-50, 192)).toBe(0);
        expect(getOverlapFromPointer(900, 192)).toBe(32);
        expect(getOverlapFromPointer(10, 0)).toBe(0);
    });

    it("reads the cell of the collision grid under the pointer", () => {
        expect(getWallCellFromPointer(0, 0, 192)).toEqual({ col: 0, row: 0 });
        expect(getWallCellFromPointer(100, 150, 192)).toEqual({
            col: 2,
            row: 3,
        });
        expect(getWallCellFromPointer(500, -10, 192)).toEqual({
            col: 3,
            row: 0,
        });
    });
});
