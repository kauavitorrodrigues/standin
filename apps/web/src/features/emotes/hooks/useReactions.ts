import { useEmoteHistory } from "@/features/emotes/hooks/useEmoteHistory";
import { useEmoteHotkeys } from "@/features/emotes/hooks/useEmoteHotkeys";
import { useSentEmoteBadge } from "@/features/emotes/hooks/useSentEmoteBadge";
import { CONTROLS_VIEWS } from "@/features/spaces/consts/controls-view";
import type { ControlsViewState } from "@/features/spaces/hooks/useControlsView";
import { listReactionBarEmotes } from "@/features/emotes/utils/getReactionBarItems";

type Options = {
    // Reactions only exist on the office. Off, the bar is closed and the keys
    // 1 to 8 are not bound.
    enabled: boolean;
    onSendEmote: (emoji: string) => void;
    // The view open over the bar, shared with the nearby panel so only one is
    // open at a time.
    controls: Pick<ControlsViewState, "view" | "toggle">;
};

// The state of the reactions bar that opens over the control bar. Clicking an
// emoji sends it and leaves the bar open, so the same one can be clicked again
// for a combo.
export const useReactions = ({ enabled, onSendEmote, controls }: Options) => {
    const { items, record } = useEmoteHistory();
    const badge = useSentEmoteBadge();
    const isOpen = enabled && controls.view === CONTROLS_VIEWS.REACTIONS;

    const send = (emoji: string) => {
        record(emoji);
        onSendEmote(emoji);
        badge.show(emoji);
    };

    useEmoteHotkeys(listReactionBarEmotes(items), send, { enabled });

    return {
        items,
        send,
        isOpen,
        onToggle: () => controls.toggle(CONTROLS_VIEWS.REACTIONS),
        // With the bar open the person already sees what they sent.
        sentEmoji: isOpen ? null : badge.emoji,
    };
};
