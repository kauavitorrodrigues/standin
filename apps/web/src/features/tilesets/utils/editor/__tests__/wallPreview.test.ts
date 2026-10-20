import { describe, expect, it } from "vitest";
import {
    AVATAR,
    TILE_CATEGORIES,
    WALL_PIECES,
    WALL_PIECE_EDGES,
    getWallStyles,
    type TileMeta,
} from "@standin/contracts";
import {
    buildWallPreview,
    getPreviewTileOrder,
} from "../wall/buildWallPreview";

const build = (skip: number[] = []): TileMeta => {
    const meta: TileMeta = {};
    Object.values(WALL_PIECES).forEach((piece, index) => {
        if (skip.includes(index)) return;
        meta[String(index)] = {
            category: TILE_CATEGORIES.WALL,
            style: "Azul",
            edges: [...WALL_PIECE_EDGES[piece]],
            // The horizontal pieces and corners have a cap, the sides do not.
            ...(piece.length === 2 || piece === "n" || piece === "s"
                ? { top: 20 + index }
                : {}),
        };
    });
    return meta;
};

describe("buildWallPreview", () => {
    it("builds the outline of a room with a cap over each north and south piece", () => {
        const meta = build();
        const [style] = getWallStyles(meta);
        const preview = buildWallPreview(meta, style);
        const bases = preview.tiles.filter(({ layer }) => layer === "base");
        const tops = preview.tiles.filter(({ layer }) => layer === "top");
        // 6 columns on two rows, plus 3 rows of two sides.
        expect(bases).toHaveLength(6 * 2 + 3 * 2);
        expect(tops).toHaveLength(6 * 2);
    });

    it("puts the cap of a wall one row above it", () => {
        const meta = build();
        const [style] = getWallStyles(meta);
        const { tiles } = buildWallPreview(meta, style);
        const base = tiles.find(
            (tile) => tile.layer === "base" && tile.col === 2 && tile.row === 5
        );
        const top = tiles.find(
            (tile) => tile.layer === "top" && tile.col === 2 && tile.row === 4
        );
        expect(base).toBeDefined();
        expect(top).toBeDefined();
    });

    it("leaves out the pieces a style lacks without breaking", () => {
        const meta = build([1, 3]);
        const [style] = getWallStyles(meta);
        const { tiles } = buildWallPreview(meta, style);
        const corners = tiles.filter(
            (tile) => tile.layer === "base" && tile.col === 5 && tile.row === 1
        );
        expect(corners).toHaveLength(0);
    });

    it("has an avatar behind the south wall and one in front of it", () => {
        const meta = build();
        const [style] = getWallStyles(meta);
        const { avatars } = buildWallPreview(meta, style);
        const [behind, front] = avatars;
        const southBottom = 6 * 32;
        expect(behind.feetY).toBeLessThan(southBottom);
        expect(front.feetY).toBeGreaterThan(southBottom);
    });

    it("keeps the body of the avatar in front clear of the south wall", () => {
        const meta = build();
        const [style] = getWallStyles(meta);
        const { avatars } = buildWallPreview(meta, style);
        const front = avatars[1];
        const southBottom = 6 * 32;
        expect(front.feetY - AVATAR.body.h).toBeGreaterThanOrEqual(southBottom);
    });
});

describe("getPreviewTileOrder", () => {
    it("a base follows its bottom and a cap is above every avatar", () => {
        expect(
            getPreviewTileOrder({ index: 0, col: 0, row: 5, layer: "base" })
        ).toBe(192);
        expect(
            getPreviewTileOrder({ index: 0, col: 0, row: 4, layer: "top" })
        ).toBeGreaterThan(500);
    });
});
