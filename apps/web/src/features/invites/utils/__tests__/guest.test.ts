import { describe, expect, it } from "vitest";
import { describeAccessEnd } from "../guest";

describe("describeAccessEnd", () => {
    it("says there is no deadline without an end", () => {
        expect(describeAccessEnd(null)).toBe("Sem prazo");
    });

    it("gives the day when there is an end", () => {
        expect(describeAccessEnd("2026-11-03T12:00:00Z")).toBe("3 nov 2026");
    });
});
