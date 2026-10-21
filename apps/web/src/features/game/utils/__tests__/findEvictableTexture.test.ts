import { describe, expect, it } from "vitest";
import { findEvictableTexture } from "../findEvictableTexture";

const IDLE_MS = 5000;

describe("findEvictableTexture", () => {
    it("is null when there is nothing cached", () => {
        expect(findEvictableTexture(new Map(), 0, IDLE_MS)).toBeNull();
    });

    it("picks the one used longest ago once it has been idle", () => {
        const used = new Map([
            ["new", 3000],
            ["old", 0],
            ["mid", 1000],
        ]);

        expect(findEvictableTexture(used, IDLE_MS, IDLE_MS)).toBe("old");
    });

    it("is null while even the oldest was used lately", () => {
        const used = new Map([["old", 1]]);

        expect(findEvictableTexture(used, IDLE_MS, IDLE_MS)).toBeNull();
    });
});
