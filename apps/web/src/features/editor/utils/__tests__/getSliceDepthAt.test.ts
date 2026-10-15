import { describe, expect, it } from "vitest";
import { getSliceDepthAt } from "@/features/editor/utils/getSliceDepthAt";

describe("getSliceDepthAt", () => {
    it("answers the depth of the whole sprite when it is not cut", () => {
        expect(getSliceDepthAt([{ crop: null, depth: 7 }], 20, 1)).toBe(7);
    });

    it("answers the depth of the strip that holds the row", () => {
        const slices = [
            { crop: { y: 0, height: 64 }, depth: 3 },
            { crop: { y: 64, height: 32 }, depth: 5 },
        ];

        expect(getSliceDepthAt(slices, 10, 1)).toBe(3);
        expect(getSliceDepthAt(slices, 64, 1)).toBe(5);
    });

    it("falls back to the depth of the object with no slices", () => {
        expect(getSliceDepthAt([], 10, 9)).toBe(9);
    });
});
