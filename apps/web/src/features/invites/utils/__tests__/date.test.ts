import { describe, expect, it } from "vitest";
import { formatDay } from "../date";

describe("formatDay", () => {
    it("is a dash without a date", () => {
        expect(formatDay(null)).toBe("—");
    });

    it("writes the day in portuguese", () => {
        // Noon UTC is the same calendar day in every time zone but the extremes.
        expect(formatDay("2026-11-03T12:00:00Z")).toBe("3 nov 2026");
    });
});
