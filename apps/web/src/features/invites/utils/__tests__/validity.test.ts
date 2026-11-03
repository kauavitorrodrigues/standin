import { describe, expect, it } from "vitest";
import { NO_VALIDITY } from "../../consts/validity";
import { toValidityHours, toValidityValue } from "../validity";

describe("validity", () => {
    it("reads null and undefined as none", () => {
        expect(toValidityValue(null)).toBe(NO_VALIDITY);
        expect(toValidityValue(undefined)).toBe(NO_VALIDITY);
    });

    it("writes hours as text", () => {
        expect(toValidityValue(168)).toBe("168");
    });

    it("reads none as null and text as hours", () => {
        expect(toValidityHours(NO_VALIDITY)).toBeNull();
        expect(toValidityHours("720")).toBe(720);
    });

    it("round trips", () => {
        for (const hours of [null, 24, 168, 720]) {
            expect(toValidityHours(toValidityValue(hours))).toBe(hours);
        }
    });
});
