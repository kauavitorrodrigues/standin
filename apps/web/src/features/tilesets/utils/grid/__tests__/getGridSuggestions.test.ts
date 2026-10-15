import { describe, expect, it } from "vitest";
import { getGridSuggestions } from "../getGridSuggestions";

describe("getGridSuggestions", () => {
    it("puts the plain grid first", () => {
        const [first] = getGridSuggestions({ w: 128, h: 64 });
        expect(first).toEqual({ margin: 0, spacing: 0, columns: 4, rows: 2 });
    });

    it("finds a margin and a spacing that fit a sheet with them", () => {
        // 2 columns of 32 px with 1 px of margin and 1 px of spacing: 67 px.
        const suggestions = getGridSuggestions({ w: 67, h: 67 });
        expect(suggestions).toContainEqual({
            margin: 1,
            spacing: 1,
            columns: 2,
            rows: 2,
        });
    });

    it("gives nothing when the image does not divide in cells", () => {
        expect(getGridSuggestions({ w: 33, h: 33 })).toEqual([]);
    });

    it("gives no more than five", () => {
        expect(
            getGridSuggestions({ w: 1024, h: 1024 }).length
        ).toBeLessThanOrEqual(5);
    });
});
