import { describe, expect, it } from "vitest";
import { formatLocalTime } from "../formatLocalTime";

describe("formatLocalTime", () => {
    it("shows the 24 hour time and says it is the local one", () => {
        expect(formatLocalTime(new Date(2026, 9, 14, 18, 23))).toBe(
            "18:23 horário local"
        );
    });

    it("pads the hour and the minute", () => {
        expect(formatLocalTime(new Date(2026, 9, 14, 6, 5))).toBe(
            "06:05 horário local"
        );
    });
});
