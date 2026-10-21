import { useHotkeyMap } from "@/hooks/useHotkeyMap";
import { isGameInputLocked } from "@/features/game/utils/inputLock";
import { EMOTE_HOTKEY_CODES } from "@/features/emotes/consts/shortcuts";

type Handler = (event: KeyboardEvent) => void;

// Keys 1 to 8 send the emojis of the bar, in its order. Off while an overlay
// holds the game input, so typing a number somewhere else never reacts.
export const useEmoteHotkeys = (
    emotes: readonly string[],
    onSend: (emoji: string) => void,
    { enabled = true }: { enabled?: boolean } = {}
) => {
    const handlers: Record<string, Handler> = {};

    emotes.forEach((emoji, index) => {
        const codes = EMOTE_HOTKEY_CODES[index];
        if (!codes) return;

        const send: Handler = (event) => {
            if (isGameInputLocked()) return;
            if (event.shiftKey) return;

            onSend(emoji);
        };
        codes.forEach((code) => {
            handlers[code] = send;
        });
    });

    useHotkeyMap(handlers, { enabled });
};
