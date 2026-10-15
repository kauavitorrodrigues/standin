import { describe, expect, it } from "vitest";
import { WALL_PIECES, WALL_PIECE_EDGES } from "../../../assets/enums/wall-edge";
import type { TileMeta } from "../../../assets/schemas/tile-meta.schema";
import { generateBlankLayout } from "../generateBlankLayout";
import type { BlankDefaults } from "../library";
import { defaults } from "./fixtures";

const PIECE_ORDER = [
    WALL_PIECES.NW,
    WALL_PIECES.N,
    WALL_PIECES.NE,
    WALL_PIECES.W,
    WALL_PIECES.E,
    WALL_PIECES.SW,
    WALL_PIECES.S,
    WALL_PIECES.SE,
];

const tileMeta: TileMeta = Object.fromEntries(
    PIECE_ORDER.map((piece, index) => [
        String(index),
        {
            category: "WALL" as const,
            solid: true,
            style: "Azul",
            edges: [...WALL_PIECE_EDGES[piece]],
        },
    ])
);

const styled: BlankDefaults = {
    floor: defaults.floor,
    wall: {
        tilesetId: "walls-style",
        tileCount: PIECE_ORDER.length,
        tileIndex: PIECE_ORDER.indexOf(WALL_PIECES.N),
        tileMeta,
    },
};

describe("generateBlankLayout with a wall style", () => {
    it("draws the perimeter with the corner and side pieces", () => {
        const layout = generateBlankLayout("XS", styled);
        const { width, height } = layout;
        const walls = layout.layers.find((layer) => layer.name === "walls");
        if (walls?.type !== "tilelayer") throw new Error("expected tile layer");
        const firstgid =
            layout.tilesets.find(({ name }) => name === "walls-style")
                ?.firstgid ?? 0;
        const pieceAt = (x: number, y: number) =>
            PIECE_ORDER[walls.data[y * width + x] - firstgid];

        expect(pieceAt(0, 0)).toBe(WALL_PIECES.NW);
        expect(pieceAt(width - 1, 0)).toBe(WALL_PIECES.NE);
        expect(pieceAt(0, height - 1)).toBe(WALL_PIECES.SW);
        expect(pieceAt(width - 1, height - 1)).toBe(WALL_PIECES.SE);
        expect(pieceAt(3, 0)).toBe(WALL_PIECES.N);
        expect(pieceAt(3, height - 1)).toBe(WALL_PIECES.S);
        expect(pieceAt(0, 3)).toBe(WALL_PIECES.W);
        expect(pieceAt(width - 1, 3)).toBe(WALL_PIECES.E);
        expect(walls.data[width + 1]).toBe(0);
    });

    it("is deterministic", () => {
        expect(generateBlankLayout("XS", styled)).toEqual(
            generateBlankLayout("XS", styled)
        );
    });
});
