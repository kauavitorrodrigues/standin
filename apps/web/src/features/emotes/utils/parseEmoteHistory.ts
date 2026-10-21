import type {
    EmoteHistory,
    EmoteUse,
} from "@/features/emotes/types/history";

export const EMPTY_EMOTE_HISTORY: EmoteHistory = {
    uses: [],
    recentOrder: [],
};

const isEmoteUse = (value: unknown): value is EmoteUse => {
    if (typeof value !== "object" || value === null) return false;

    const candidate = value as Record<string, unknown>;
    return (
        typeof candidate.emoji === "string" &&
        typeof candidate.count === "number" &&
        Number.isFinite(candidate.count) &&
        typeof candidate.lastUsedAt === "number" &&
        Number.isFinite(candidate.lastUsedAt)
    );
};

// Whatever was stored, as a history. Storage can hold anything, so what is
// not the right shape is dropped instead of reaching the bar.
export const parseEmoteHistory = (stored: unknown): EmoteHistory => {
    if (typeof stored !== "object" || stored === null) {
        return EMPTY_EMOTE_HISTORY;
    }

    const candidate = stored as Record<string, unknown>;
    return {
        uses: Array.isArray(candidate.uses)
            ? candidate.uses.filter(isEmoteUse)
            : [],
        recentOrder: Array.isArray(candidate.recentOrder)
            ? candidate.recentOrder.filter(
                (emoji): emoji is string => typeof emoji === "string"
            )
            : [],
    };
};
