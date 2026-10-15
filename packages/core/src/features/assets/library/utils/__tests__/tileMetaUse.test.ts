import { describe, expect, it } from "vitest";
import type { TileMeta } from "@standin/contracts";
import { isTileMetaAppendOnly } from "../tileMetaUse";

const stored: TileMeta = {
    "0": { category: "FLOOR", blankDefault: true },
    "1": { category: "WALL", solid: true, top: 2 },
};

describe("isTileMetaAppendOnly", () => {
    it("accepts the same tileMeta, in any key order", () => {
        expect(isTileMetaAppendOnly(stored, stored)).toBe(true);
        expect(
            isTileMetaAppendOnly(stored, {
                "1": { top: 2, solid: true, category: "WALL" },
                "0": { blankDefault: true, category: "FLOOR" },
            })
        ).toBe(true);
    });

    it("accepts new entries and a blankDefault change", () => {
        expect(
            isTileMetaAppendOnly(stored, {
                ...stored,
                "0": { category: "FLOOR" },
                "3": { category: "FLOOR", blankDefault: true },
            })
        ).toBe(true);
    });

    it("refuses to change or remove an entry that already exists", () => {
        expect(
            isTileMetaAppendOnly(stored, {
                ...stored,
                "1": { category: "WALL", solid: false, top: 2 },
            })
        ).toBe(false);
        expect(isTileMetaAppendOnly(stored, { "0": stored["0"]! })).toBe(false);
    });

    it("accepts anything over an empty tileMeta", () => {
        expect(isTileMetaAppendOnly(null, stored)).toBe(true);
    });
});
