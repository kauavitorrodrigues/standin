import { describe, expect, it } from "vitest";
import {
    footprintFitsFrame,
    getFrameSize,
    isMultipleOfTile,
} from "../getFrameSize";

describe("getFrameSize", () => {
    it("is the whole image for a static asset", () => {
        expect(getFrameSize({ w: 64, h: 96 }, 1)).toEqual({ w: 64, h: 96 });
    });

    it("splits a strip into equal frames", () => {
        expect(getFrameSize({ w: 192, h: 64 }, 6)).toEqual({ w: 32, h: 64 });
    });

    it("is null when the width does not divide by the frame count", () => {
        expect(getFrameSize({ w: 100, h: 32 }, 6)).toBeNull();
    });
});

describe("isMultipleOfTile", () => {
    it("accepts multiples of 32 only", () => {
        expect(isMultipleOfTile({ w: 64, h: 32 })).toBe(true);
        expect(isMultipleOfTile({ w: 40, h: 32 })).toBe(false);
        expect(isMultipleOfTile({ w: 0, h: 32 })).toBe(false);
    });
});

describe("footprintFitsFrame", () => {
    const frame = { w: 64, h: 64 };

    it("accepts a footprint inside the frame", () => {
        expect(footprintFitsFrame(frame, { w: 1, h: 2, offsetX: 1 })).toBe(
            true
        );
    });

    it("rejects one that sticks out", () => {
        expect(footprintFitsFrame(frame, { w: 2, h: 1, offsetX: 1 })).toBe(
            false
        );
        expect(footprintFitsFrame(frame, { w: 1, h: 3, offsetX: 0 })).toBe(
            false
        );
    });
});
