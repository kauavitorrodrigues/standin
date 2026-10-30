import { describe, expect, it } from "vitest";
import { SERVICE_TOKEN_EXPIRY_OPTIONS } from "../../consts/expiryOptions";
import { formatExpiryDay } from "../formatExpiryDay";
import { resolveExpiryDay } from "../resolveExpiryDay";

const NOW = new Date(2026, 9, 30, 15);

describe("resolveExpiryDay", () => {
    it("has no day when the token does not expire", () => {
        expect(resolveExpiryDay("never", "2030-01-01", NOW)).toBeNull();
    });

    it("counts the days from today", () => {
        expect(resolveExpiryDay("30d", "", NOW)).toBe("2026-11-29");
        expect(resolveExpiryDay("90d", "", NOW)).toBe("2027-01-28");
        expect(resolveExpiryDay("1y", "", NOW)).toBe("2027-10-30");
    });

    it("uses the day typed for the specific date", () => {
        expect(resolveExpiryDay("custom", "2028-02-29", NOW)).toBe(
            "2028-02-29"
        );
        expect(resolveExpiryDay("custom", "", NOW)).toBe("");
    });

    it("resolves every option of the list", () => {
        for (const option of SERVICE_TOKEN_EXPIRY_OPTIONS) {
            expect(() => resolveExpiryDay(option.id, "", NOW)).not.toThrow();
        }
    });
});

describe("formatExpiryDay", () => {
    it("writes the day as day/month/year", () => {
        expect(formatExpiryDay("2026-11-30")).toBe("30/11/2026");
    });
});
