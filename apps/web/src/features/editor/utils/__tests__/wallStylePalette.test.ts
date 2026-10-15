import { describe, expect, it } from "vitest";
import {
    TILE_CATEGORIES,
    WALL_PIECES,
    WALL_PIECE_EDGES,
    type WallPiece,
} from "@standin/contracts";
import { describePaletteTile } from "@/features/editor/utils/describePaletteTile";
import { getPaletteTiles } from "@/features/editor/utils/getPaletteTiles";
import { isTileBrush } from "@/features/editor/utils/isTileBrush";

const ORDER: WallPiece[] = Object.values(WALL_PIECES);

const buildTileMeta = (style: string, skip: WallPiece[] = [], start = 0) =>
    Object.fromEntries(
        ORDER.flatMap((piece, offset) =>
            skip.includes(piece)
                ? []
                : [
                    [
                        String(start + offset),
                        {
                            category: TILE_CATEGORIES.WALL,
                            style,
                            edges: [...WALL_PIECE_EDGES[piece]],
                        },
                    ],
                ]
        )
    );

describe("getPaletteTiles with wall styles", () => {
    it("lists a complete style as one tile, drawn with its front wall", () => {
        const tiles = getPaletteTiles(
            { tileMeta: buildTileMeta("Azul") },
            TILE_CATEGORIES.WALL
        );

        expect(tiles).toHaveLength(1);
        expect(tiles[0].index).toBe(ORDER.indexOf(WALL_PIECES.S));
        expect(tiles[0].style).toMatchObject({ name: "Azul", missing: [] });
        expect(tiles[0].style?.pieceIndexes).toHaveLength(8);
    });

    it("lists one tile per style when a tileset has two", () => {
        const tiles = getPaletteTiles(
            {
                tileMeta: {
                    ...buildTileMeta("Azul"),
                    ...buildTileMeta("Cinza", [], 20),
                },
            },
            null
        );

        expect(tiles.map((tile) => tile.style?.name)).toEqual([
            "Azul",
            "Cinza",
        ]);
    });

    it("keeps walls that are not part of a style as they were", () => {
        const tiles = getPaletteTiles(
            {
                tileMeta: {
                    "40": { category: TILE_CATEGORIES.WALL, solid: true },
                },
            },
            null
        );

        expect(tiles).toEqual([
            { index: 40, category: "WALL", solid: true, hasTop: false },
        ]);
    });

    it("says what an incomplete style lacks", () => {
        const [tile] = getPaletteTiles(
            { tileMeta: buildTileMeta("Azul", [WALL_PIECES.N]) },
            null
        );

        expect(tile.style?.missing).toEqual([WALL_PIECES.N]);
        expect(describePaletteTile(tile, "Parede")).toBe(
            "Parede Azul incompleta, falta: parede de fundo"
        );
    });
});

describe("describePaletteTile", () => {
    it("names a complete style and a plain tile", () => {
        const [style] = getPaletteTiles(
            { tileMeta: buildTileMeta("Azul") },
            null
        );

        expect(describePaletteTile(style, "Parede")).toBe("Parede Azul");
        expect(
            describePaletteTile(
                {
                    index: 7,
                    category: "FLOOR",
                    solid: false,
                    hasTop: false,
                },
                "Piso"
            )
        ).toBe("Piso 7");
    });
});

describe("isTileBrush", () => {
    const [style] = getPaletteTiles({ tileMeta: buildTileMeta("Azul") }, null);

    it("selects a style when the brush is any of its pieces", () => {
        expect(isTileBrush({ tilesetId: "t", tileIndex: 2 }, "t", style)).toBe(
            true
        );
        expect(isTileBrush({ tilesetId: "t", tileIndex: 30 }, "t", style)).toBe(
            false
        );
        expect(isTileBrush({ tilesetId: "x", tileIndex: 2 }, "t", style)).toBe(
            false
        );
    });

    it("selects a plain tile only by its own index", () => {
        const plain = {
            index: 5,
            category: "FLOOR" as const,
            solid: false,
            hasTop: false,
        };

        expect(isTileBrush({ tilesetId: "t", tileIndex: 5 }, "t", plain)).toBe(
            true
        );
        expect(isTileBrush(null, "t", plain)).toBe(false);
    });
});
