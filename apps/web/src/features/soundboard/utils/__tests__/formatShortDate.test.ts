import { describe, expect, it } from "vitest";
import { formatShortDate } from "../formatShortDate";

describe("formatShortDate", () => {
    it("shows the day, a short month and a two digit year", () => {
        const text = formatShortDate(Date.UTC(2025, 2, 5, 12));

        expect(text).toContain("05");
        expect(text).toContain("25");
        expect(text.toLowerCase()).toContain("mar");
    });

    it("is the day in UTC, whatever the zone of the browser", () => {
        expect(formatShortDate(Date.UTC(2025, 2, 5, 0, 30))).toBe(
            formatShortDate(Date.UTC(2025, 2, 5, 23, 30))
        );
    });
});
