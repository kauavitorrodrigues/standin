import { describe, expect, it } from "vitest";
import { SOUNDBOARD_MAX_DURATION_MS } from "@standin/contracts";
import { checkClipLimits } from "../../lib/checkClipLimits";
import { isOverLimit } from "../isOverLimit";
import { resolveUploadBlockReason } from "../resolveUploadBlockReason";

describe("isOverLimit", () => {
    it("is false for a clip that fits", () => {
        expect(isOverLimit(checkClipLimits(5150))).toBe(false);
    });

    it("is false at exactly the longest clip", () => {
        expect(isOverLimit(checkClipLimits(SOUNDBOARD_MAX_DURATION_MS))).toBe(
            false
        );
    });

    it("is true one millisecond past the longest clip", () => {
        expect(
            isOverLimit(checkClipLimits(SOUNDBOARD_MAX_DURATION_MS + 1))
        ).toBe(true);
    });

    it("is not about an empty or too short selection", () => {
        expect(isOverLimit(checkClipLimits(0))).toBe(false);
        expect(isOverLimit(checkClipLimits(10))).toBe(false);
    });

    it("goes with a reason that blocks the submit", () => {
        const report = checkClipLimits(SOUNDBOARD_MAX_DURATION_MS + 1);

        expect(isOverLimit(report)).toBe(true);
        expect(resolveUploadBlockReason(report)).not.toBeNull();
    });
});
