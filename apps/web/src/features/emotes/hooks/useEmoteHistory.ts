import { useCallback, useSyncExternalStore } from "react";
import { emoteHistoryPreference } from "@/features/emotes/lib/emoteHistoryPreference";
import { recordEmoteUse } from "@/features/emotes/utils/recordEmoteUse";
import {
    getReactionBarItems,
    listReactionBarEmotes,
} from "@/features/emotes/utils/getReactionBarItems";

// The reactions of the bar and the way to count a use of one. The history is
// read live from the browser storage, so every bar shows the same.
export const useEmoteHistory = () => {
    const history = useSyncExternalStore(
        emoteHistoryPreference.subscribe,
        emoteHistoryPreference.get
    );
    const items = getReactionBarItems(history);

    const record = useCallback((emoji: string) => {
        const current = emoteHistoryPreference.get();
        const visible = listReactionBarEmotes(getReactionBarItems(current));
        emoteHistoryPreference.set(
            recordEmoteUse(current, emoji, Date.now(), visible)
        );
    }, []);

    return { items, record };
};
