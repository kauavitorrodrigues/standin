import { describe, expect, it } from "vitest";
import { clipToLimit } from "../consts/limit";

describe("clipToLimit", () => {
    it("keeps a paste that fits", () => {
        expect(clipToLimit("abc", 2, 0, 10)).toBe("abc");
    });

    it("cuts a paste at the limit", () => {
        expect(clipToLimit("abcdef", 7, 0, 10)).toBe("abc");
    });

    it("counts the selection that the paste replaces as free room", () => {
        expect(clipToLimit("abcdef", 10, 4, 10)).toBe("abcd");
    });

    it("gives nothing when the field is full", () => {
        expect(clipToLimit("abc", 10, 0, 10)).toBe("");
    });
});
