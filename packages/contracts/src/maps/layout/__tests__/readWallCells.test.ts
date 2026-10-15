import { describe, expect, it } from "vitest";
import { readWallCells } from "../readWallCells";
import type { LooseLayout } from "../types";

const layoutWith = (data: number[], name = "walls"): LooseLayout => ({
    width: 3,
    height: 2,
    layers: [{ type: "tilelayer", name, width: 3, height: 2, data }],
});

describe("readWallCells", () => {
    it("keys every cell with a tile as column,row", () => {
        const cells = readWallCells(layoutWith([0, 5, 0, 7, 0, 0]));
        expect([...cells].sort()).toEqual(["0,1", "1,0"]);
    });

    it("reads a missing layer as empty", () => {
        expect(
            readWallCells(layoutWith([1, 1, 1, 1, 1, 1], "ground")).size
        ).toBe(0);
        expect(readWallCells({}).size).toBe(0);
    });

    it("reads malformed data as empty", () => {
        const layout: LooseLayout = {
            layers: [{ name: "walls", width: 3, data: "nope" }],
        };
        expect(readWallCells(layout).size).toBe(0);
    });
});
