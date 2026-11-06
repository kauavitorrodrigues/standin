import { describe, expect, it } from "vitest";
import { isSameCell } from "@/features/editor/utils/isSameCell";

describe("isSameCell", () => {
    it("is true for the same coordinates", () => {
        expect(isSameCell([2, 3], [2, 3])).toBe(true);
    });

    it("is false when either coordinate differs", () => {
        expect(isSameCell([2, 3], [3, 3])).toBe(false);
        expect(isSameCell([2, 3], [2, 4])).toBe(false);
    });

    it("is false when a cell is missing", () => {
        expect(isSameCell(null, [0, 0])).toBe(false);
        expect(isSameCell([0, 0], null)).toBe(false);
    });
});
