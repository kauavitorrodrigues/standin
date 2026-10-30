import { describe, expect, it } from "vitest";
import { formatClock } from "../formatClock";

describe("formatClock", () => {
    it("shows minutes and two digits of seconds", () => {
        expect(formatClock(65_000)).toBe("1:05");
        expect(formatClock(10_000)).toBe("0:10");
        expect(formatClock(0)).toBe("0:00");
    });

    it("rounds to the nearest second", () => {
        expect(formatClock(5_499)).toBe("0:05");
        expect(formatClock(5_500)).toBe("0:06");
    });

    it("does not go below zero", () => {
        expect(formatClock(-3_000)).toBe("0:00");
    });
});
