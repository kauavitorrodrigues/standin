import { describe, expect, it } from "vitest";
import { cellToWorld, TILE_SIZE } from "@standin/contracts";
import { formatCell } from "@/features/editor/utils/formatCell";
import { getHoverCell } from "@/features/editor/utils/getHoverCell";

describe("getHoverCell", () => {
    const map = { columns: 10, rows: 5 };

    it("finds the cell under a world position", () => {
        expect(
            getHoverCell({ worldX: TILE_SIZE * 3 + 5, worldY: 0, ...map })
        ).toEqual([3, 0]);
    });

    it("round trips with cellToWorld", () => {
        const [worldX, worldY] = cellToWorld(4, 2);

        expect(getHoverCell({ worldX, worldY, ...map })).toEqual([4, 2]);
    });

    it("is null outside the map", () => {
        expect(getHoverCell({ worldX: -1, worldY: 0, ...map })).toBeNull();
        expect(
            getHoverCell({ worldX: TILE_SIZE * 10, worldY: 0, ...map })
        ).toBeNull();
        expect(
            getHoverCell({ worldX: 0, worldY: TILE_SIZE * 5, ...map })
        ).toBeNull();
    });
});

describe("formatCell", () => {
    it("writes the coordinates", () => {
        expect(formatCell([3, 7])).toBe("x: 3  y: 7");
    });

    it("is empty without a cell", () => {
        expect(formatCell(null)).toBe("");
    });
});
