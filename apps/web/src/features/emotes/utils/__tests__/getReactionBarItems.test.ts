import { describe, expect, it } from "vitest";
import {
    DEFAULT_EMOTES,
    FILL_EMOTES,
    RECENT_SLOT_COUNT,
} from "@/features/emotes/consts/reactions";
import { EMPTY_EMOTE_HISTORY } from "../parseEmoteHistory";
import {
    getReactionBarItems,
    listReactionBarEmotes,
} from "../getReactionBarItems";

describe("getReactionBarItems", () => {
    it("fills the recent slots with the defaults for a new person", () => {
        const items = getReactionBarItems(EMPTY_EMOTE_HISTORY);

        expect(items.fixed).toEqual(DEFAULT_EMOTES);
        expect(items.recents).toEqual(FILL_EMOTES);
    });

    it("puts the recent emojis before the fill", () => {
        const items = getReactionBarItems({
            uses: [],
            recentOrder: ["😄", "😙"],
        });

        expect(items.recents).toEqual(["😄", "😙", FILL_EMOTES[0]]);
    });

    it("never repeats a fixed reaction, even with another skin tone", () => {
        const items = getReactionBarItems({
            uses: [],
            recentOrder: ["👏🏽", "❤", "😄"],
        });

        expect(items.recents).toEqual(["😄", ...FILL_EMOTES.slice(0, 2)]);
    });

    it("never shows more recent slots than the bar has", () => {
        const items = getReactionBarItems({
            uses: [],
            recentOrder: ["😄", "😙", "😎", "🥳", "🤩"],
        });

        expect(items.recents).toHaveLength(RECENT_SLOT_COUNT);
    });

    it("lists the fixed ones first, in the order of the shortcuts", () => {
        const items = getReactionBarItems(EMPTY_EMOTE_HISTORY);

        expect(listReactionBarEmotes(items)).toEqual([
            ...DEFAULT_EMOTES,
            ...FILL_EMOTES,
        ]);
    });
});
