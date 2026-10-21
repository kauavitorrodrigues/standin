import { describe, expect, it } from "vitest";
import { EMPTY_EMOTE_HISTORY, parseEmoteHistory } from "../parseEmoteHistory";

describe("parseEmoteHistory", () => {
    it("falls back to an empty history for anything else", () => {
        for (const stored of [null, undefined, 1, "x", []]) {
            expect(parseEmoteHistory(stored)).toEqual(EMPTY_EMOTE_HISTORY);
        }
    });

    it("keeps what is well formed and drops the rest", () => {
        const history = parseEmoteHistory({
            uses: [
                { emoji: "👏", count: 2, lastUsedAt: 5 },
                { emoji: 1, count: 2, lastUsedAt: 5 },
                { emoji: "🎉", count: "2", lastUsedAt: 5 },
                null,
            ],
            recentOrder: ["😄", 7, "😎"],
        });

        expect(history).toEqual({
            uses: [{ emoji: "👏", count: 2, lastUsedAt: 5 }],
            recentOrder: ["😄", "😎"],
        });
    });

    it("treats a missing list as empty", () => {
        expect(parseEmoteHistory({})).toEqual(EMPTY_EMOTE_HISTORY);
    });
});
