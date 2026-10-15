import { describe, expect, it } from "vitest";
import { LIBRARY_ISSUE_CODES } from "@standin/contracts";
import { readFrameSize } from "../readFrameSize";

describe("readFrameSize", () => {
    it("takes the whole image as the frame of a static asset", () => {
        expect(readFrameSize({ width: 64, height: 96 }, null).frame).toEqual({
            w: 64,
            h: 96,
        });
    });

    it("divides the width by the frame count of a strip", () => {
        expect(readFrameSize({ width: 192, height: 64 }, 6).frame).toEqual({
            w: 32,
            h: 64,
        });
    });

    it("refuses a frame that is not a multiple of 32", () => {
        const result = readFrameSize({ width: 40, height: 32 }, null);

        expect(result.frame).toBeNull();
        expect(result.issues[0]?.code).toBe(
            LIBRARY_ISSUE_CODES.SPRITE_SIZE_NOT_MULTIPLE_OF_TILE
        );
    });

    it("refuses a width that the frame count does not divide", () => {
        const result = readFrameSize({ width: 160, height: 32 }, 3);

        expect(result.frame).toBeNull();
        expect(result.issues[0]?.code).toBe(
            LIBRARY_ISSUE_CODES.ANIMATION_FRAME_WIDTH_INVALID
        );
    });

    it("refuses a strip whose frames are not a multiple of 32", () => {
        const result = readFrameSize({ width: 150, height: 32 }, 3);

        expect(result.issues[0]?.code).toBe(
            LIBRARY_ISSUE_CODES.SPRITE_SIZE_NOT_MULTIPLE_OF_TILE
        );
    });
});
