import { describe, expect, it } from "vitest";
import { TILE_SIZE } from "@standin/contracts";
import { readPngSize } from "../../../../../lib/readPngSize";
import { buildChunk } from "../buildChunk";
import { buildColorTileset } from "../buildColorTileset";
import { crc32 } from "../crc32";
import { encodePng } from "../encodePng";

describe("crc32", () => {
    it("matches the standard check value", () => {
        // The CRC-32 of "123456789" is the usual test vector.
        expect(crc32(Buffer.from("123456789", "ascii"))).toBe(0xcbf43926);
    });
});

describe("buildChunk", () => {
    it("wraps data with its length, type and checksum", () => {
        const chunk = buildChunk("IEND", Buffer.alloc(0));

        expect(chunk.length).toBe(12);
        expect(chunk.readUInt32BE(0)).toBe(0);
        expect(chunk.subarray(4, 8).toString("ascii")).toBe("IEND");
        expect(chunk.readUInt32BE(8)).toBe(crc32(Buffer.from("IEND", "ascii")));
    });
});

describe("encodePng", () => {
    it("writes a PNG whose header carries the size", () => {
        const png = encodePng(
            3,
            2,
            Array.from({ length: 6 }, () => [10, 20, 30, 255])
        );

        expect(readPngSize(png)).toEqual({ width: 3, height: 2 });
    });
});

describe("buildColorTileset", () => {
    it("lays one tile per color in a single row", () => {
        const tileset = buildColorTileset([
            [1, 2, 3, 255],
            [4, 5, 6, 255],
            [7, 8, 9, 255],
        ]);

        expect(readPngSize(tileset)).toEqual({
            width: 3 * TILE_SIZE,
            height: TILE_SIZE,
        });
    });
});
