import { describe, expect, it } from "vitest";
import { pickFreeKey, slugifyKey } from "../deriveKey";

describe("slugifyKey", () => {
    it("lowercases, drops accents and uses hyphens", () => {
        expect(slugifyKey("Cadeira Giratória", "asset")).toBe(
            "cadeira-giratoria"
        );
    });

    it("falls back when nothing is left of the name", () => {
        expect(slugifyKey("???", "asset")).toBe("asset");
    });
});

describe("pickFreeKey", () => {
    it("keeps the key when it is free", () => {
        expect(pickFreeKey("mug", new Set())).toBe("mug");
    });

    it("adds -2, -3 on a collision", () => {
        expect(pickFreeKey("mug", new Set(["mug"]))).toBe("mug-2");
        expect(pickFreeKey("mug", new Set(["mug", "mug-2"]))).toBe("mug-3");
    });
});
