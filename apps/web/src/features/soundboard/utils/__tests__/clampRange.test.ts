import { describe, expect, it } from "vitest";
import { clampRange } from "../clampRange";

describe("clampRange", () => {
    it("keeps a range inside the source", () => {
        expect(clampRange({ startMs: -50, endMs: 9000 }, 4000)).toEqual({
            startMs: 0,
            endMs: 4000,
        });
    });

    it("puts the edges in order", () => {
        expect(clampRange({ startMs: 3000, endMs: 1000 }, 4000)).toEqual({
            startMs: 1000,
            endMs: 3000,
        });
    });

    it("leaves a valid range alone", () => {
        expect(clampRange({ startMs: 500, endMs: 1500 }, 4000)).toEqual({
            startMs: 500,
            endMs: 1500,
        });
    });
});
