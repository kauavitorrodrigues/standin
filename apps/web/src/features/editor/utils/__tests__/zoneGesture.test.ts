import { describe, expect, it } from "vitest";
import { getZoneRect } from "@/features/editor/utils/getZoneRect";
import { isAreaBigEnough } from "@/features/editor/utils/isAreaBigEnough";

describe("getZoneRect", () => {
    it("includes both corners whichever way the drag goes", () => {
        expect(getZoneRect([5, 6], [2, 3])).toEqual({ x: 2, y: 3, w: 4, h: 4 });
        expect(getZoneRect([2, 3], [5, 6])).toEqual({ x: 2, y: 3, w: 4, h: 4 });
    });
});

describe("isAreaBigEnough", () => {
    it("needs the minimum on both sides", () => {
        expect(isAreaBigEnough({ x: 0, y: 0, w: 2, h: 2 })).toBe(true);
        expect(isAreaBigEnough({ x: 0, y: 0, w: 1, h: 5 })).toBe(false);
        expect(isAreaBigEnough({ x: 0, y: 0, w: 5, h: 1 })).toBe(false);
    });
});
