import { describe, expect, it } from "vitest";
import { resolveUploadPhase } from "../resolveUploadPhase";

describe("resolveUploadPhase", () => {
    it("is idle while nothing is submitting", () => {
        expect(
            resolveUploadPhase({ isSubmitting: false, progress: null })
        ).toBe("idle");
    });

    it("is encoding until the bytes start to go", () => {
        expect(resolveUploadPhase({ isSubmitting: true, progress: null })).toBe(
            "encoding"
        );
    });

    it("is sending once there is progress", () => {
        expect(resolveUploadPhase({ isSubmitting: true, progress: 0 })).toBe(
            "sending"
        );
    });
});
