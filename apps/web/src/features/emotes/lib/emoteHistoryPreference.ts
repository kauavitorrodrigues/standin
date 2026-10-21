import { createLocalPreference } from "@/lib/createLocalPreference";
import { EMOTE_HISTORY_STORAGE_KEY } from "@/features/emotes/consts/history";
import {
    EMPTY_EMOTE_HISTORY,
    parseEmoteHistory,
} from "@/features/emotes/utils/parseEmoteHistory";
import type { EmoteHistory } from "@/features/emotes/types/history";

// What the person sent lately, in this browser only.
export const emoteHistoryPreference = createLocalPreference<EmoteHistory>({
    key: EMOTE_HISTORY_STORAGE_KEY,
    fallback: EMPTY_EMOTE_HISTORY,
    parse: parseEmoteHistory,
});
