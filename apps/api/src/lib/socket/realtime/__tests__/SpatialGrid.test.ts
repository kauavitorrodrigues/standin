import { describe, expect, it } from "vitest";
import { SpatialGrid } from "../SpatialGrid";

describe("SpatialGrid", () => {
    it("finds who is inside the radius and not who is past it", () => {
        const grid = new SpatialGrid(100);
        grid.set("near", 50, 50);
        grid.set("edge", 150, 50);
        grid.set("far", 400, 400);

        expect(grid.query(50, 50, 100).sort()).toEqual(["edge", "near"]);
    });

    it("reaches across the border of a cell", () => {
        const grid = new SpatialGrid(100);
        grid.set("a", 99, 99);
        grid.set("b", 101, 101);

        expect(grid.query(99, 99, 10).sort()).toEqual(["a", "b"]);
    });

    it("moves an id between cells", () => {
        const grid = new SpatialGrid(100);
        grid.set("a", 10, 10);
        grid.set("a", 910, 910);

        expect(grid.query(10, 10, 50)).toEqual([]);
        expect(grid.query(910, 910, 50)).toEqual(["a"]);
        expect(grid.size).toBe(1);
    });

    it("forgets a removed id", () => {
        const grid = new SpatialGrid(100);
        grid.set("a", 10, 10);
        grid.remove("a");

        expect(grid.has("a")).toBe(false);
        expect(grid.query(10, 10, 50)).toEqual([]);
        expect(() => grid.remove("a")).not.toThrow();
    });

    it("handles negative coordinates", () => {
        const grid = new SpatialGrid(100);
        grid.set("a", -10, -10);

        expect(grid.query(0, 0, 20)).toEqual(["a"]);
    });
});
