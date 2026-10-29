import { describe, expect, it } from "vitest";
import { findRepeatedIndexes } from "../findRepeatedIndexes";

describe("findRepeatedIndexes", () => {
    it("lists the positions of the values seen before", () => {
        expect(findRepeatedIndexes(["a", "b", "a", "c", "b", "a"])).toEqual([
            2, 4, 5,
        ]);
    });

    it("is empty when every value is unique", () => {
        expect(findRepeatedIndexes(["a", "b"])).toEqual([]);
        expect(findRepeatedIndexes([])).toEqual([]);
    });
});
