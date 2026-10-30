import { describe, expect, it } from "vitest";
import { formatExpiry, formatLastUsed } from "../formatTokenDate";

describe("formatTokenDate", () => {
    it("says a token was never used", () => {
        expect(formatLastUsed(null)).toBe("Nunca usado");
    });

    it("says a token does not expire", () => {
        expect(formatExpiry(null)).toBe("Não expira");
    });

    it("writes the dates in Portuguese", () => {
        expect(formatExpiry(new Date(2026, 11, 31, 10))).toBe("31 dez 2026");
        expect(formatLastUsed(new Date(2026, 9, 14, 8, 5))).toBe(
            "14 out 2026, 08:05"
        );
    });

    it("reads a date that came as a string", () => {
        expect(formatExpiry(new Date(2026, 0, 2, 10).toISOString())).toBe(
            "2 jan 2026"
        );
    });
});
