import { describe, expect, it } from "vitest";
import { percentile } from "../percentile";

describe("percentile", () => {
    it("is 0 for no values", () => {
        expect(percentile([], 50)).toBe(0);
    });

    it("takes the nearest rank", () => {
        const values = Array.from({ length: 100 }, (_, i) => i + 1);
        expect(percentile(values, 50)).toBe(50);
        expect(percentile(values, 99)).toBe(99);
        expect(percentile([5, 1, 3], 100)).toBe(5);
        expect(percentile([5, 1, 3], 1)).toBe(1);
    });
});
