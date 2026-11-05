import { useEffect } from "react";
import { useAsRef } from "@/hooks/useAsRef";
import { isTypingTarget } from "@/hooks/useHotkey";
import type { DanceHotkeyOptions } from "@/features/emotes/types/dance";
import { isGameInputLocked } from "@/features/game/utils/inputLock";
import {
    isDanceKeyDown,
    isDanceKeyUp,
} from "@/features/emotes/utils/isDanceKeyDown";

// Holding Z dances and letting go stops, so it is not a toggle. The dance also
// ends when the window loses focus or the tab is hidden, since the key up
// would never reach the page then. Off, or while an overlay holds the game
// input, nothing starts.
export const useDanceHotkey = (
    onDance: (isDancing: boolean) => void,
    { enabled = true }: DanceHotkeyOptions = {}
) => {
    const onDanceRef = useAsRef(onDance);

    useEffect(() => {
        if (!enabled) return;

        const stop = () => onDanceRef.current(false);

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.defaultPrevented) return;
            if (!isDanceKeyDown(event)) return;
            if (isTypingTarget(event.target)) return;
            if (isGameInputLocked()) return;

            event.preventDefault();
            onDanceRef.current(true);
        };
        const handleKeyUp = (event: KeyboardEvent) => {
            if (isDanceKeyUp(event)) stop();
        };
        const handleVisibility = () => {
            if (document.hidden) stop();
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("blur", stop);
        document.addEventListener("visibilitychange", handleVisibility);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("blur", stop);
            document.removeEventListener("visibilitychange", handleVisibility);
            // Turned off or gone while the key was down: the dance ends too.
            stop();
        };
    }, [enabled, onDanceRef]);
};
