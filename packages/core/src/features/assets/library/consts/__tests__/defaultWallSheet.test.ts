import {
    TileMetaSchema,
    generateBlankLayout,
    resolveBlankDefaults,
    validateWallStyles,
} from "@standin/contracts";
import { describe, expect, it } from "vitest";
import {
    WALL_SHEET_IMAGE,
    WALL_SHEET_META,
    WALL_STYLE_NAME,
} from "../defaultWallSheet";

const PNG_WIDTH_OFFSET = 16;
const PNG_HEIGHT_OFFSET = 20;

describe("default wall sheet", () => {
    it("is a sheet of 8 columns and 2 rows of 32 px tiles", () => {
        expect(WALL_SHEET_IMAGE.readUInt32BE(PNG_WIDTH_OFFSET)).toBe(256);
        expect(WALL_SHEET_IMAGE.readUInt32BE(PNG_HEIGHT_OFFSET)).toBe(64);
    });

    it("has a valid tile meta", () => {
        expect(TileMetaSchema.safeParse(WALL_SHEET_META).success).toBe(true);
    });

    it("makes one complete style with the eight pieces", () => {
        const reports = validateWallStyles(WALL_SHEET_META);
        expect(reports).toHaveLength(1);
        expect(reports[0].name).toBe(WALL_STYLE_NAME);
        expect(reports[0].missing).toEqual([]);
    });

    it("points the six tall pieces at a cap on the top row", () => {
        const withTop = Object.values(WALL_SHEET_META).filter(
            (tile) => tile.top !== undefined
        );
        expect(withTop).toHaveLength(6);
        expect(withTop.every((tile) => (tile.top as number) < 8)).toBe(true);
    });

    it("gives the side pieces a one column collision mask", () => {
        const sides = Object.values(WALL_SHEET_META).filter(
            (tile) => tile.solidMask !== undefined
        );
        expect(sides).toHaveLength(2);
    });

    it("marks one wall tile as the default and draws the blank map from it", () => {
        const resolved = resolveBlankDefaults([
            {
                id: "floors",
                tileCount: 1,
                tileMeta: { "0": { category: "FLOOR", blankDefault: true } },
            },
            { id: "walls", tileCount: 16, tileMeta: WALL_SHEET_META },
        ]);
        expect(resolved.errors).toEqual([]);

        const layout = generateBlankLayout("XS", resolved.defaults!);
        const walls = layout.layers.find((layer) => layer.name === "walls");
        if (walls?.type !== "tilelayer") throw new Error("expected tile layer");
        const used = new Set(walls.data.filter((gid) => gid > 0));
        expect(used.size).toBe(8);
    });
});
