import { describe, expect, it } from "vitest";
import { normalizeSearch } from "../normalizeSearch";

describe("normalizeSearch", () => {
    it("drops accents and case", () => {
        expect(normalizeSearch("Reunião ÁGIL Café")).toBe("reuniao agil cafe");
    });

    it("keeps plain text as it is", () => {
        expect(normalizeSearch("mesa 2")).toBe("mesa 2");
    });
});
