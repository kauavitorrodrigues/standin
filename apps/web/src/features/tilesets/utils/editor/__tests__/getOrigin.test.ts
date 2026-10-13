import { describe, expect, it } from "vitest";
import { getTileOrigin } from "../getOrigin";

describe("getTileOrigin", () => {
    it("walks the grid row by row", () => {
        const grid = { columns: 4, margin: 0, spacing: 0 };
        expect(getTileOrigin(0, grid)).toEqual({ x: 0, y: 0 });
        expect(getTileOrigin(5, grid)).toEqual({ x: 32, y: 32 });
    });

    it("counts margin and spacing", () => {
        const grid = { columns: 4, margin: 1, spacing: 2 };
        expect(getTileOrigin(5, grid)).toEqual({ x: 35, y: 35 });
    });
});
