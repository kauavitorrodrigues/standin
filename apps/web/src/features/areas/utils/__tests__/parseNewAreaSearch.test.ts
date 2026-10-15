import { describe, expect, it } from "vitest";
import { parseNewAreaSearch } from "../parseNewAreaSearch";

describe("parseNewAreaSearch", () => {
    it("reads the size from the URL", () => {
        expect(parseNewAreaSearch({ width: "6", height: 5 })).toEqual({
            width: 6,
            height: 5,
        });
    });

    it("falls back to 12 x 8 when the size is missing or invalid", () => {
        expect(parseNewAreaSearch({ width: "abc", height: -1 })).toEqual({
            width: 12,
            height: 8,
        });
        expect(parseNewAreaSearch({})).toEqual({ width: 12, height: 8 });
    });
});
