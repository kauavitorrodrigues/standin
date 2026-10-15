import { describe, expect, it } from "vitest";
import { pruneTileMeta } from "../pruneTileMeta";

describe("pruneTileMeta", () => {
    it("drops the tiles past the last one and the tops that point past it", () => {
        const meta = {
            "0": { category: "WALL" as const, top: 9 },
            "1": { category: "WALL" as const, top: 2 },
            "7": { category: "FLOOR" as const },
        };
        expect(pruneTileMeta(meta, 4)).toEqual({
            "0": { category: "WALL" },
            "1": { category: "WALL", top: 2 },
        });
    });

    it("leaves the marks alone when they all fit", () => {
        const meta = { "3": { category: "FLOOR" as const, solid: true } };
        expect(pruneTileMeta(meta, 4)).toEqual(meta);
    });
});
