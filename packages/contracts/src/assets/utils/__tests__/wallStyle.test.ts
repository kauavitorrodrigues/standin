import { describe, expect, it } from "vitest";
import { TileMetaSchema } from "../../schemas/tile-meta.schema";
import type { TileMeta } from "../../schemas/tile-meta.schema";
import { WALL_PIECES, WALL_PIECE_EDGES } from "../../enums/wall-edge";
import { getWallPiece } from "../wallPiece";
import {
    getWallStyles,
    isWallComplete,
    validateWallStyle,
    validateWallStyles,
} from "../wallStyle";

const piece = (name: keyof typeof WALL_PIECE_EDGES, style: string) => ({
    category: "WALL" as const,
    style,
    edges: [...WALL_PIECE_EDGES[name]],
});

const buildStyle = (style: string, start: number): TileMeta =>
    Object.fromEntries(
        Object.values(WALL_PIECES).map((name, offset) => [
            String(start + offset),
            piece(name, style),
        ])
    );

describe("getWallPiece", () => {
    it("names each of the eight pieces whatever the edge order", () => {
        expect(getWallPiece(["E", "N"])).toBe("ne");
        expect(getWallPiece(["N", "E"])).toBe("ne");
        expect(getWallPiece(["W"])).toBe("w");
        expect(getWallPiece(["S", "W"])).toBe("sw");
    });

    it("refuses opposite edges, three edges, four edges, none and repeats", () => {
        expect(getWallPiece(["N", "S"])).toBeNull();
        expect(getWallPiece(["E", "W"])).toBeNull();
        expect(getWallPiece(["N", "E", "S"])).toBeNull();
        expect(getWallPiece(["N", "E", "S", "W"])).toBeNull();
        expect(getWallPiece([])).toBeNull();
        expect(getWallPiece(["N", "N"])).toBeNull();
    });
});

describe("tile meta of a wall", () => {
    const parse = (entry: unknown) =>
        TileMetaSchema.safeParse({ "0": entry }).success;

    it("accepts a complete wall piece", () => {
        expect(
            parse({
                category: "WALL",
                style: "Azul",
                edges: ["N", "E"],
                solidMask: [
                    [false, false, false, true],
                    [false, false, false, true],
                    [false, false, false, true],
                    [false, false, false, true],
                ],
                overlap: 8,
            })
        ).toBe(true);
    });

    it("keeps a payload without wall fields valid", () => {
        expect(parse({ category: "WALL", solid: true, top: 3 })).toBe(true);
        expect(parse({ category: "FLOOR" })).toBe(true);
    });

    it("refuses wall fields on a tile that is not a wall", () => {
        expect(
            parse({ category: "FLOOR", style: "Azul", edges: ["N"] })
        ).toBe(false);
        expect(parse({ category: "DECORATION", overlap: 4 })).toBe(false);
    });

    it("refuses edges that are not a piece, and edges without a style", () => {
        expect(
            parse({ category: "WALL", style: "Azul", edges: ["N", "S"] })
        ).toBe(false);
        expect(parse({ category: "WALL", edges: ["N"] })).toBe(false);
    });

    it("refuses a collision mask of the wrong size or with no solid cell", () => {
        expect(
            parse({
                category: "WALL",
                solidMask: [[true, true]],
            })
        ).toBe(false);
        expect(
            parse({
                category: "WALL",
                solidMask: Array.from({ length: 4 }, () =>
                    Array.from({ length: 4 }, () => false)
                ),
            })
        ).toBe(false);
    });

    it("refuses an overlap outside the tile", () => {
        expect(parse({ category: "WALL", overlap: 33 })).toBe(false);
        expect(parse({ category: "WALL", overlap: -1 })).toBe(false);
    });
});

describe("validateWallStyle", () => {
    it("reports a complete style", () => {
        const [style] = getWallStyles(buildStyle("Azul", 0));
        expect(isWallComplete(style)).toBe(true);
        expect(validateWallStyle(style).missing).toEqual([]);
    });

    it("lists the corners a style lacks", () => {
        const meta = buildStyle("Azul", 0);
        delete meta["1"];
        delete meta["7"];
        const [report] = validateWallStyles(meta);
        expect(report.isComplete).toBe(false);
        expect(report.missing).toEqual(["ne", "nw"]);
    });

    it("validates two styles of the same tileset apart", () => {
        const meta = { ...buildStyle("Azul", 0), ...buildStyle("Cinza", 20) };
        delete meta["22"];
        const reports = validateWallStyles(meta);
        expect(reports.map((report) => report.name)).toEqual(["Azul", "Cinza"]);
        expect(reports[0].isComplete).toBe(true);
        expect(reports[1].missing).toEqual(["e"]);
    });

    it("ignores tiles that are not walls or have no edges", () => {
        const meta: TileMeta = {
            "0": { category: "FLOOR" },
            "1": { category: "WALL", solid: true },
        };
        expect(validateWallStyles(meta)).toEqual([]);
    });
});
