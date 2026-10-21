import {
    DEFAULT_EMOTES,
    FILL_EMOTES,
    RECENT_SLOT_COUNT,
} from "@/features/emotes/consts/reactions";
import type {
    EmoteHistory,
    ReactionBarItems,
} from "@/features/emotes/types/history";
import { normalizeEmoji } from "@/features/emotes/utils/normalizeEmoji";

// What the bar shows: the fixed reactions, then the recent ones that are not
// already fixed, filled up with the defaults for a person with no history.
export const getReactionBarItems = (
    history: EmoteHistory
): ReactionBarItems => {
    const taken = new Set(DEFAULT_EMOTES.map(normalizeEmoji));
    const recents: string[] = [];

    for (const emoji of [...history.recentOrder, ...FILL_EMOTES]) {
        if (recents.length >= RECENT_SLOT_COUNT) break;

        const key = normalizeEmoji(emoji);
        if (taken.has(key)) continue;

        taken.add(key);
        recents.push(emoji);
    }

    return { fixed: DEFAULT_EMOTES, recents };
};

// Every emoji on the bar, in the order of the keyboard shortcuts.
export const listReactionBarEmotes = (items: ReactionBarItems): string[] => [
    ...items.fixed,
    ...items.recents,
];
