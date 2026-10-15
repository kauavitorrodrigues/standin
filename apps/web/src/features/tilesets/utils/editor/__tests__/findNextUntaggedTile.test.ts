import { describe, expect, it } from "vitest";
import { findNextUntaggedTile } from "../findNextUntaggedTile";

const tagged = { category: "FLOOR" } as const;

describe("findNextUntaggedTile", () => {
    it("finds the next tile without category", () => {
        expect(findNextUntaggedTile({ "0": tagged, "1": tagged }, 4, 0)).toBe(
            2
        );
    });

    it("wraps around to the start", () => {
        expect(findNextUntaggedTile({ "1": tagged, "2": tagged }, 3, 1)).toBe(
            0
        );
    });

    it("returns null when every tile has a category", () => {
        expect(
            findNextUntaggedTile({ "0": tagged, "1": tagged }, 2, 0)
        ).toBeNull();
    });
});
