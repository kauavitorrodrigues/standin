import { EMOTE_HISTORY } from "@/features/emotes/consts/history";
import type { EmoteUse } from "@/features/emotes/types/history";

// Count, weighing more what was used in the last days: a use today counts
// twice, and the extra fades to nothing over the fresh window.
export const scoreEmoteUse = (use: EmoteUse, now: number): number => {
    const age = Math.max(0, now - use.lastUsedAt);
    const freshness = Math.max(0, 1 - age / EMOTE_HISTORY.FRESH_WINDOW_MS);
    return use.count * (1 + freshness);
};
