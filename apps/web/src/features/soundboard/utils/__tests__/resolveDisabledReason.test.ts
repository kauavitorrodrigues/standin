import { describe, expect, it } from "vitest";
import { resolveDisabledReason } from "../resolveDisabledReason";

describe("resolveDisabledReason", () => {
    it("is null when the clip can go out", () => {
        expect(
            resolveDisabledReason({
                micError: null,
                hasMicStream: true,
                isHeadphonesOn: false,
            })
        ).toBeNull();
    });

    it("explains a microphone error first", () => {
        expect(
            resolveDisabledReason({
                micError: "denied",
                hasMicStream: false,
                isHeadphonesOn: true,
            })
        ).toBe("Permissão de microfone negada");
    });

    it("explains privacy mode", () => {
        expect(
            resolveDisabledReason({
                micError: null,
                hasMicStream: true,
                isHeadphonesOn: true,
            })
        ).toContain("fones");
    });

    it("explains a missing stream", () => {
        expect(
            resolveDisabledReason({
                micError: null,
                hasMicStream: false,
                isHeadphonesOn: false,
            })
        ).not.toBeNull();
    });
});
