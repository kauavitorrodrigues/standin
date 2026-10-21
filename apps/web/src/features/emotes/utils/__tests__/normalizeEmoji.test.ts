import { describe, expect, it } from "vitest";
import { normalizeEmoji } from "../normalizeEmoji";

describe("normalizeEmoji", () => {
    it("drops the variation selector", () => {
        expect(normalizeEmoji("❤️")).toBe("❤");
    });

    it("drops the skin tone", () => {
        expect(normalizeEmoji("👋🏽")).toBe("👋");
    });

    it("leaves a plain emoji alone", () => {
        expect(normalizeEmoji("🎉")).toBe("🎉");
    });
});
