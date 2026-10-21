import { describe, expect, it } from "vitest";
import { EMOTE_HISTORY } from "@/features/emotes/consts/history";
import type { EmoteHistory } from "@/features/emotes/types/history";
import { EMPTY_EMOTE_HISTORY } from "../parseEmoteHistory";
import { recordEmoteUse } from "../recordEmoteUse";
import { scoreEmoteUse } from "../scoreEmoteUse";

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = 100 * DAY_MS;
const NOTHING_VISIBLE: string[] = [];

describe("scoreEmoteUse", () => {
    it("doubles the count for a use right now", () => {
        expect(
            scoreEmoteUse({ emoji: "👏", count: 3, lastUsedAt: NOW }, NOW)
        ).toBe(6);
    });

    it("fades to the plain count after the fresh window", () => {
        const lastUsedAt = NOW - EMOTE_HISTORY.FRESH_WINDOW_MS;

        expect(scoreEmoteUse({ emoji: "👏", count: 3, lastUsedAt }, NOW)).toBe(
            3
        );
    });
});

describe("recordEmoteUse", () => {
    it("counts repeated uses of the same emoji, whatever its tone", () => {
        let history = recordEmoteUse(
            EMPTY_EMOTE_HISTORY,
            "👍",
            NOW,
            NOTHING_VISIBLE
        );
        history = recordEmoteUse(history, "👍🏽", NOW + 1, NOTHING_VISIBLE);

        expect(history.uses).toEqual([
            { emoji: "👍🏽", count: 2, lastUsedAt: NOW + 1 },
        ]);
    });

    it("puts an emoji that is not on the bar at the front of the recents", () => {
        const history = recordEmoteUse(
            { uses: [], recentOrder: ["😄"] },
            "😎",
            NOW,
            ["👏"]
        );

        expect(history.recentOrder).toEqual(["😎", "😄"]);
    });

    it("moves an emoji already in the recents to the front, once", () => {
        const history = recordEmoteUse(
            { uses: [], recentOrder: ["😄", "😎"] },
            "😎",
            NOW,
            ["👏"]
        );

        expect(history.recentOrder).toEqual(["😎", "😄"]);
    });

    it("leaves the order alone for an emoji already on the bar", () => {
        const history = recordEmoteUse(
            { uses: [], recentOrder: ["😄", "😎"] },
            "😎",
            NOW,
            ["👏", "😄", "😎"]
        );

        expect(history.recentOrder).toEqual(["😄", "😎"]);
        expect(history.uses[0]).toMatchObject({ emoji: "😎", count: 1 });
    });

    it("keeps the order inside its limit", () => {
        const recentOrder = Array.from(
            { length: EMOTE_HISTORY.MAX_RECENT_ORDER },
            (_, index) => `e${index}`
        );

        const history = recordEmoteUse(
            { uses: [], recentOrder },
            "new",
            NOW,
            NOTHING_VISIBLE
        );

        expect(history.recentOrder).toHaveLength(EMOTE_HISTORY.MAX_RECENT_ORDER);
        expect(history.recentOrder[0]).toBe("new");
    });

    it("forgets uses older than the age limit", () => {
        const old: EmoteHistory = {
            uses: [
                {
                    emoji: "🕰️",
                    count: 99,
                    lastUsedAt: NOW - EMOTE_HISTORY.MAX_AGE_MS - 1,
                },
            ],
            recentOrder: [],
        };

        const history = recordEmoteUse(old, "👏", NOW, NOTHING_VISIBLE);

        expect(history.uses.map((use) => use.emoji)).toEqual(["👏"]);
    });

    it("keeps the most recent uses and the best scored of the rest", () => {
        const total =
            EMOTE_HISTORY.KEEP_RECENT + EMOTE_HISTORY.KEEP_TOP_SCORED + 10;
        const uses = Array.from({ length: total }, (_, index) => ({
            emoji: `e${index}`,
            count: index + 1,
            // Newer for a higher index, all inside the age limit.
            lastUsedAt: NOW - (total - index) * 1000,
        }));

        const history = recordEmoteUse(
            { uses, recentOrder: [] },
            "fresh",
            NOW,
            NOTHING_VISIBLE
        );

        expect(history.uses).toHaveLength(
            EMOTE_HISTORY.KEEP_RECENT + EMOTE_HISTORY.KEEP_TOP_SCORED
        );
        expect(history.uses.map((use) => use.emoji)).toContain("fresh");
    });
});
