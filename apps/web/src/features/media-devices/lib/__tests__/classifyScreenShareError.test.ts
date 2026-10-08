import { describe, expect, it } from "vitest";
import { classifyScreenShareError } from "../classifyScreenShareError";
import { SCREEN_SHARE_ERRORS } from "../../consts/videoError";

describe("classifyScreenShareError", () => {
    it("treats a closed picker as not an error", () => {
        expect(
            classifyScreenShareError(new DOMException("x", "NotAllowedError"))
        ).toBeNull();
    });

    it("treats an aborted request as not an error", () => {
        expect(
            classifyScreenShareError(new DOMException("x", "AbortError"))
        ).toBeNull();
    });

    it("reports an unsupported browser", () => {
        expect(
            classifyScreenShareError(new DOMException("x", "NotSupportedError"))
        ).toBe(SCREEN_SHARE_ERRORS.UNSUPPORTED);
    });

    it("falls back to unknown for anything else", () => {
        expect(classifyScreenShareError(new Error("boom"))).toBe(
            SCREEN_SHARE_ERRORS.UNKNOWN
        );
        expect(classifyScreenShareError(new DOMException("x", "AbortErrorX"))).toBe(
            SCREEN_SHARE_ERRORS.UNKNOWN
        );
    });
});
