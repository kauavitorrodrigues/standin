import { describe, expect, it } from "vitest";
import {
    getCellAt,
    getCellCenter,
    isSameCell,
} from "@/features/game/utils/cell";

describe("getCellCenter", () => {
    it("is the middle of the tile, in px", () => {
        expect(getCellCenter({ column: 2, row: 1 })).toEqual({ x: 80, y: 48 });
    });
});

describe("getCellAt", () => {
    it("is the tile that holds the point", () => {
        expect(getCellAt({ x: 80, y: 48 })).toEqual({ column: 2, row: 1 });
        expect(getCellAt({ x: 63.9, y: 0 })).toEqual({ column: 1, row: 0 });
    });

    it("puts the edge of a tile in the next one", () => {
        expect(getCellAt({ x: 64, y: 32 })).toEqual({ column: 2, row: 1 });
    });
});

describe("isSameCell", () => {
    it("matches on column and row", () => {
        expect(isSameCell({ column: 1, row: 2 }, { column: 1, row: 2 })).toBe(
            true
        );
        expect(isSameCell({ column: 1, row: 2 }, { column: 2, row: 1 })).toBe(
            false
        );
    });

    it("treats no tile as the same as no tile", () => {
        expect(isSameCell(null, null)).toBe(true);
        expect(isSameCell({ column: 0, row: 0 }, null)).toBe(false);
    });
});
