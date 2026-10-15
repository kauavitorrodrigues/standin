import { describe, expect, it } from "vitest";
import { TileStroke } from "@/features/editor/lib/TileStroke";

describe("TileStroke", () => {
    it("starts with the first cell", () => {
        expect(new TileStroke([2, 3]).getCells()).toEqual([[2, 3]]);
    });

    it("fills the line between two events, with no holes", () => {
        const stroke = new TileStroke([0, 0]);

        const added = stroke.extend([4, 0]);

        expect(added).toEqual([
            [1, 0],
            [2, 0],
            [3, 0],
            [4, 0],
        ]);
        expect(stroke.getCells()).toHaveLength(5);
    });

    it("fills a diagonal without leaving a gap", () => {
        const stroke = new TileStroke([0, 0]);

        stroke.extend([3, 3]);

        expect(stroke.getCells()).toEqual([
            [0, 0],
            [1, 1],
            [2, 2],
            [3, 3],
        ]);
    });

    it("keeps a cell once when the drag goes back over it", () => {
        const stroke = new TileStroke([0, 0]);
        stroke.extend([2, 0]);

        const added = stroke.extend([0, 0]);

        expect(added).toEqual([]);
        expect(stroke.getCells()).toHaveLength(3);
    });
});
