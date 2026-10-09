import { describe, expect, it } from "vitest";
import { formatCreatedAgo } from "../formatCreatedAgo";

const now = new Date("2026-10-08T12:00:00.000Z");

describe("formatCreatedAgo", () => {
    it("reads as now for something created seconds ago", () => {
        expect(formatCreatedAgo("2026-10-08T11:59:30.000Z", now)).toBe("agora");
    });

    it("uses hours and days with the Portuguese suffix", () => {
        expect(formatCreatedAgo("2026-10-08T11:00:00.000Z", now)).toBe(
            "há 1 hora"
        );
        expect(formatCreatedAgo("2026-10-04T12:00:00.000Z", now)).toBe(
            "há 4 dias"
        );
    });
});
