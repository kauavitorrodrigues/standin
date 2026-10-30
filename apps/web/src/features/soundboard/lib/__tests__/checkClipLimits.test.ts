import { describe, expect, it } from "vitest";
import {
    SOUNDBOARD_MAX_DURATION_MS,
    SOUNDBOARD_MIN_DURATION_MS,
} from "@standin/contracts";
import { checkClipLimits } from "../checkClipLimits";
import { estimateClipBytes } from "../estimateClipBytes";

describe("checkClipLimits", () => {
    it("accepts a clip inside the limits", () => {
        expect(checkClipLimits(3000).issues).toEqual([]);
    });

    it("accepts the longest clip exactly", () => {
        expect(checkClipLimits(SOUNDBOARD_MAX_DURATION_MS).issues).toEqual([]);
    });

    it("rejects a clip one millisecond over the longest", () => {
        expect(checkClipLimits(SOUNDBOARD_MAX_DURATION_MS + 1).issues).toEqual([
            "TOO_LONG",
        ]);
    });

    it("rejects an empty selection", () => {
        expect(checkClipLimits(0).issues).toEqual(["EMPTY"]);
        expect(checkClipLimits(0).estimatedBytes).toBe(0);
    });

    it("rejects a selection that is too short and accepts the shortest", () => {
        expect(checkClipLimits(SOUNDBOARD_MIN_DURATION_MS - 1).issues).toEqual([
            "TOO_SHORT",
        ]);
        expect(checkClipLimits(SOUNDBOARD_MIN_DURATION_MS).issues).toEqual([]);
    });

    it("estimates a ten second clip well under the size limit", () => {
        expect(estimateClipBytes(SOUNDBOARD_MAX_DURATION_MS)).toBeLessThan(
            200 * 1024
        );
    });

    it("grows the estimate with the duration", () => {
        expect(estimateClipBytes(2000)).toBeGreaterThan(
            estimateClipBytes(1000)
        );
    });
});
