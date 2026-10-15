import { describe, expect, it } from "vitest";
import { getTileIndicesToDraw } from "../getIndicesToDraw";

const meta = {
    "3": { category: "FLOOR" as const },
    "1": { category: "WALL" as const },
};
const base = {
    meta,
    filter: null,
    selected: [],
    hovered: null,
    topTile: null,
    preview: [],
};

describe("getTileIndicesToDraw", () => {
    it("draws only the tiles that say something", () => {
        expect(getTileIndicesToDraw(base)).toEqual([1, 3]);
    });

    it("adds the selected, the hovered and the top tile", () => {
        expect(
            getTileIndicesToDraw({
                ...base,
                selected: [7, 3],
                hovered: 9,
                topTile: 2,
            })
        ).toEqual([1, 2, 3, 7, 9]);
    });

    it("adds the tiles a tool is about to touch", () => {
        expect(getTileIndicesToDraw({ ...base, preview: [8, 3] })).toEqual([
            1, 3, 8,
        ]);
    });

    it("keeps only the highlighted category, and still the selected", () => {
        expect(
            getTileIndicesToDraw({ ...base, filter: "FLOOR", selected: [1] })
        ).toEqual([1, 3]);
        expect(getTileIndicesToDraw({ ...base, filter: "FLOOR" })).toEqual([3]);
    });

    it("keeps the tagged tiles when the legend is on the ones with none", () => {
        expect(getTileIndicesToDraw({ ...base, filter: "UNTAGGED" })).toEqual([
            1, 3,
        ]);
    });
});
