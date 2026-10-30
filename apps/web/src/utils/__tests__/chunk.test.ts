import { describe, expect, it } from "vitest";
import { chunk } from "../chunk";

describe("chunk", () => {
    it("splits the list in rows, the last one with what is left", () => {
        expect(chunk([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([
            [1, 2, 3],
            [4, 5, 6],
            [7],
        ]);
    });

    it("gives no rows for an empty list", () => {
        expect(chunk([], 3)).toEqual([]);
    });
});
