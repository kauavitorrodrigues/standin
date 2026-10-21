import { describe, expect, it } from "vitest";
import { EMOTE_COMBO_MAX } from "@standin/contracts";
import { isSingleEmoji, validateEmote } from "../validateEmote";

describe("isSingleEmoji", () => {
    it("accepts one emoji, with or without a variation selector", () => {
        expect(isSingleEmoji("👏")).toBe(true);
        expect(isSingleEmoji("❤️")).toBe(true);
    });

    it("accepts a skin tone and a ZWJ sequence as one emoji", () => {
        expect(isSingleEmoji("👋🏽")).toBe(true);
        expect(isSingleEmoji("👨‍👩‍👧‍👦")).toBe(true);
    });

    it("rejects empty, plain text and several emojis", () => {
        expect(isSingleEmoji("")).toBe(false);
        expect(isSingleEmoji("a")).toBe(false);
        expect(isSingleEmoji("hello 👏")).toBe(false);
        expect(isSingleEmoji("👏👏")).toBe(false);
    });

    it("rejects what is not a string", () => {
        expect(isSingleEmoji(1)).toBe(false);
        expect(isSingleEmoji(null)).toBe(false);
        expect(isSingleEmoji(undefined)).toBe(false);
    });

    it("rejects a sequence longer than any real emoji", () => {
        const giant = Array.from({ length: 12 }, () => "👨").join("‍");

        expect(isSingleEmoji(giant)).toBe(false);
    });
});

describe("validateEmote", () => {
    it("keeps a valid emote", () => {
        expect(validateEmote({ emoji: "🎉", count: 2 })).toEqual({
            emoji: "🎉",
            count: 2,
        });
    });

    it("clamps the count between 1 and the combo limit", () => {
        expect(validateEmote({ emoji: "🎉", count: 500 })?.count).toBe(
            EMOTE_COMBO_MAX
        );
        expect(validateEmote({ emoji: "🎉", count: -3 })?.count).toBe(1);
        expect(validateEmote({ emoji: "🎉", count: 0 })?.count).toBe(1);
    });

    it("rounds the count down to a whole number", () => {
        expect(validateEmote({ emoji: "🎉", count: 2.9 })?.count).toBe(2);
    });

    it("rejects a count that is not a finite number", () => {
        expect(validateEmote({ emoji: "🎉", count: "2" })).toBeNull();
        expect(validateEmote({ emoji: "🎉", count: Number.NaN })).toBeNull();
        expect(
            validateEmote({ emoji: "🎉", count: Number.POSITIVE_INFINITY })
        ).toBeNull();
        expect(validateEmote({ emoji: "🎉" })).toBeNull();
    });

    it("rejects anything that is not an object with an emoji", () => {
        expect(validateEmote(null)).toBeNull();
        expect(validateEmote("🎉")).toBeNull();
        expect(validateEmote({ emoji: "text", count: 1 })).toBeNull();
    });
});
