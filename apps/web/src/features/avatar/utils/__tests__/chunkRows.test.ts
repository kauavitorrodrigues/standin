import { describe, expect, it } from "vitest";
import { chunkRows } from "../chunkRows";

describe("chunkRows", () => {
    it("splits the list in rows, the last one with what is left", () => {
        expect(chunkRows([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([
            [1, 2, 3],
            [4, 5, 6],
            [7],
        ]);
    });

    it("gives no rows for an empty list", () => {
        expect(chunkRows([], 3)).toEqual([]);
    });
});
