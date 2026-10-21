import { useCallback, useEffect } from "react";
import { useHotkey } from "@/hooks/useHotkey";
import {
    isGameInputLocked,
    acquireGameInputLock,
} from "@/features/game/utils/inputLock";
import { CONTROLS_VIEWS } from "@/features/spaces/consts/controls-view";
import type { ControlsViewState } from "@/features/spaces/hooks/useControlsView";
import {
    NEARBY_CHAT_HOTKEY,
    NEARBY_CHAT_KEEP_OPEN_SELECTOR,
    NEARBY_CHAT_POPUP_SELECTOR,
} from "@/features/nearby-chat/consts/nearby-chat";

type Options = {
    // The nearby chat only exists on the office, where there are avatars.
    enabled: boolean;
    controls: Pick<ControlsViewState, "view" | "open" | "close" | "toggle">;
};

const isInsideNearbyChat = (target: EventTarget | null): boolean =>
    target instanceof Element &&
    (target.closest(NEARBY_CHAT_KEEP_OPEN_SELECTOR) !== null ||
        target.closest(NEARBY_CHAT_POPUP_SELECTOR) !== null);

// Whether the panel is open and how it opens and closes. It closes with Esc or
// with a press outside of it (the map included), and opens with the slash key
// or the button. While open it holds the game input, so the keys typed in the
// field never move the avatar.
export const useNearbyChat = ({ enabled, controls }: Options) => {
    const isOpen = enabled && controls.view === CONTROLS_VIEWS.NEARBY;
    const { open, close, toggle } = controls;

    const openPanel = useCallback(() => open(CONTROLS_VIEWS.NEARBY), [open]);
    const closePanel = useCallback(() => close(CONTROLS_VIEWS.NEARBY), [close]);
    const togglePanel = useCallback(
        () => toggle(CONTROLS_VIEWS.NEARBY),
        [toggle]
    );

    useHotkey(
        [NEARBY_CHAT_HOTKEY],
        () => {
            // Another overlay holds the input: the slash is not for the chat.
            // The panel's own lock does not count against closing it.
            if (isGameInputLocked() && !isOpen) return;

            togglePanel();
        },
        { enabled }
    );

    useEffect(() => {
        if (!isOpen) return;

        return acquireGameInputLock();
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") closePanel();
        };
        const handlePointerDown = (event: MouseEvent) => {
            if (!isInsideNearbyChat(event.target)) closePanel();
        };

        window.addEventListener("keydown", handleKeyDown);
        document.addEventListener("mousedown", handlePointerDown, true);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mousedown", handlePointerDown, true);
        };
    }, [isOpen, closePanel]);

    return { isOpen, open: openPanel, close: closePanel, toggle: togglePanel };
};
