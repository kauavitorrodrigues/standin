import { describe, expect, it } from "vitest";
import {
    PART_GRID_GAP,
    PART_GRID_MAX_COLUMNS,
    PART_GRID_TILE_SIZE,
} from "../../consts/editor/grid";
import { getGridColumns, getGridTemplate } from "../gridColumns";

const widthOf = (columns: number) =>
    columns * PART_GRID_TILE_SIZE + (columns - 1) * PART_GRID_GAP;

describe("getGridColumns", () => {
    it("fits as many tiles as the width allows", () => {
        expect(getGridColumns(widthOf(3))).toBe(3);
        expect(getGridColumns(widthOf(4))).toBe(4);
    });

    it("needs the room of the gaps for one more tile", () => {
        expect(getGridColumns(widthOf(4) - 1)).toBe(3);
    });

    it("never goes over the maximum", () => {
        expect(getGridColumns(5000)).toBe(PART_GRID_MAX_COLUMNS);
    });

    it("keeps at least one column in a very narrow area", () => {
        expect(getGridColumns(0)).toBe(1);
        expect(getGridColumns(20)).toBe(1);
    });
});

describe("getGridTemplate", () => {
    it("repeats the tile size for each column", () => {
        expect(getGridTemplate(3)).toBe(`repeat(3, ${PART_GRID_TILE_SIZE}px)`);
    });
});
