import { EMOTE_HISTORY } from "@/features/emotes/consts/history";
import type {
    EmoteHistory,
    EmoteUse,
} from "@/features/emotes/types/history";
import { normalizeEmoji } from "@/features/emotes/utils/normalizeEmoji";
import { scoreEmoteUse } from "@/features/emotes/utils/scoreEmoteUse";

// Forgets the old uses and keeps the most recent ones plus the best scored of
// the rest.
const pruneUses = (uses: EmoteUse[], now: number): EmoteUse[] => {
    const { MAX_AGE_MS, KEEP_RECENT, KEEP_TOP_SCORED } = EMOTE_HISTORY;
    const fresh = uses
        .filter((use) => now - use.lastUsedAt <= MAX_AGE_MS)
        .sort((a, b) => b.lastUsedAt - a.lastUsedAt);
    const recent = fresh.slice(0, KEEP_RECENT);
    const topScored = fresh
        .slice(KEEP_RECENT)
        .sort((a, b) => scoreEmoteUse(b, now) - scoreEmoteUse(a, now))
        .slice(0, KEEP_TOP_SCORED);

    return [...recent, ...topScored];
};

const countUse = (uses: EmoteUse[], emoji: string, now: number): EmoteUse[] => {
    const key = normalizeEmoji(emoji);
    const previous = uses.find((use) => normalizeEmoji(use.emoji) === key);
    const next: EmoteUse = {
        emoji,
        count: (previous?.count ?? 0) + 1,
        lastUsedAt: now,
    };

    return [
        ...uses.filter((use) => normalizeEmoji(use.emoji) !== key),
        next,
    ];
};

// An emoji that is not on the bar enters the front of the recent order. One
// that already is on the bar leaves the order as it is.
const orderRecents = (
    recentOrder: string[],
    emoji: string,
    visible: readonly string[]
): string[] => {
    const key = normalizeEmoji(emoji);
    if (visible.some((shown) => normalizeEmoji(shown) === key)) {
        return recentOrder;
    }

    return [
        emoji,
        ...recentOrder.filter((shown) => normalizeEmoji(shown) !== key),
    ].slice(0, EMOTE_HISTORY.MAX_RECENT_ORDER);
};

// `visible` is every emoji on the bar when the emoji was sent.
export const recordEmoteUse = (
    history: EmoteHistory,
    emoji: string,
    now: number,
    visible: readonly string[]
): EmoteHistory => ({
    uses: pruneUses(countUse(history.uses, emoji, now), now),
    recentOrder: orderRecents(history.recentOrder, emoji, visible),
});
