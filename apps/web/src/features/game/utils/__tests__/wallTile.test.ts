import { describe, expect, it } from "vitest";
import {
    PLAIN_WALL_TILE,
    parseWallTileProperties,
    toWallTileMeta,
} from "@/features/game/utils/wallTile";

const mask = JSON.stringify([
    [false, false, false, true],
    [false, false, false, true],
    [false, false, false, true],
    [false, false, false, true],
]);

describe("parseWallTileProperties", () => {
    it("reads a plain tile when there are no properties", () => {
        expect(parseWallTileProperties(undefined)).toEqual(PLAIN_WALL_TILE);
        expect(parseWallTileProperties({})).toEqual(PLAIN_WALL_TILE);
    });

    it("reads the mask, the overlap, the top and the solid flag", () => {
        const meta = parseWallTileProperties({
            solid: true,
            solidMask: mask,
            overlap: 8,
            top: 3,
        });
        expect(meta.solid).toBe(true);
        expect(meta.solidMask?.[0]).toEqual([false, false, false, true]);
        expect(meta.overlap).toBe(8);
        expect(meta.top).toBe(3);
    });

    it("reads a top of 0, which is the first tile of the tileset", () => {
        expect(parseWallTileProperties({ top: 0 }).top).toBe(0);
    });

    it("drops a mask that is not four by four or not JSON", () => {
        expect(
            parseWallTileProperties({ solidMask: "[[true]]" }).solidMask
        ).toBeNull();
        expect(
            parseWallTileProperties({ solidMask: "not json" }).solidMask
        ).toBeNull();
        expect(parseWallTileProperties({ solidMask: 4 }).solidMask).toBeNull();
    });

    it("ignores an overlap that is not a positive integer", () => {
        expect(parseWallTileProperties({ overlap: -2 }).overlap).toBe(0);
        expect(parseWallTileProperties({ overlap: 1.5 }).overlap).toBe(0);
        expect(parseWallTileProperties({ overlap: "4" }).overlap).toBe(0);
    });
});

describe("toWallTileMeta", () => {
    it("reads the tile meta of the library the same way", () => {
        const meta = toWallTileMeta({
            category: "WALL",
            solidMask: [
                [true, false, false, false],
                [true, false, false, false],
                [true, false, false, false],
                [true, false, false, false],
            ],
            overlap: 6,
            top: 2,
        });
        expect(meta.solidMask).not.toBeNull();
        expect(meta.overlap).toBe(6);
        expect(meta.top).toBe(2);
        expect(meta.solid).toBe(false);
    });

    it("reads a missing entry as a plain tile", () => {
        expect(toWallTileMeta(undefined)).toEqual(PLAIN_WALL_TILE);
    });
});
