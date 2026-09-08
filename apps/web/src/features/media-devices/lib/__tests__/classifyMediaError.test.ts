import { describe, expect, it } from "vitest";
import { classifyMediaError } from "@/features/media-devices/lib/classifyMediaError";

describe("classifyMediaError", () => {
    it("classifies NotAllowedError as denied", () => {
        const err = new DOMException("blocked", "NotAllowedError");
        expect(classifyMediaError(err)).toBe("denied");
    });

    it("classifies PermissionDeniedError as denied", () => {
        const err = new DOMException("blocked", "PermissionDeniedError");
        expect(classifyMediaError(err)).toBe("denied");
    });

    it("classifies NotFoundError as not-found", () => {
        const err = new DOMException("missing", "NotFoundError");
        expect(classifyMediaError(err)).toBe("not-found");
    });

    it("classifies DevicesNotFoundError as not-found", () => {
        const err = new DOMException("missing", "DevicesNotFoundError");
        expect(classifyMediaError(err)).toBe("not-found");
    });

    it("classifies other DOMExceptions as unknown", () => {
        const err = new DOMException("boom", "AbortError");
        expect(classifyMediaError(err)).toBe("unknown");
    });

    it("classifies non-DOMException values as unknown", () => {
        expect(classifyMediaError(new Error("boom"))).toBe("unknown");
        expect(classifyMediaError("boom")).toBe("unknown");
        expect(classifyMediaError(undefined)).toBe("unknown");
    });
});
