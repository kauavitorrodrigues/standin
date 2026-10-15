import { useCallback, useEffect, useRef, useState } from "react";
import type { GameEngineHandle } from "@/features/game/types/game";
import type { HoverState } from "@/features/game/types/hover";

// Time the card stays after the mouse leaves the target, so the mouse can
// travel from the target to the card and press its button.
const LEAVE_GRACE_MS = 200;

// The target a card is drawn for, on the hover event of one kind of target.
// It follows the hover of the game and stays while the mouse is on the card.
export const useHoverTarget = (
    handle: GameEngineHandle | null,
    event: string
) => {
    const [hover, setHover] = useState<HoverState | null>(null);
    const isOnCardRef = useRef(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const cancelLeave = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = null;
    }, []);

    const scheduleLeave = useCallback(() => {
        cancelLeave();
        timerRef.current = setTimeout(() => {
            if (!isOnCardRef.current) setHover(null);
        }, LEAVE_GRACE_MS);
    }, [cancelLeave]);

    useEffect(() => {
        if (!handle) return;

        const unsubscribe = handle.subscribeToHover(event, (next) => {
            if (!next) return scheduleLeave();

            cancelLeave();
            setHover(next);
        });

        return () => {
            unsubscribe();
            cancelLeave();
        };
    }, [handle, event, scheduleLeave, cancelLeave]);

    const enterCard = useCallback(() => {
        isOnCardRef.current = true;
        cancelLeave();
        if (hover) handle?.pinHover(event, hover.id);
    }, [cancelLeave, handle, event, hover]);

    const leaveCard = useCallback(() => {
        isOnCardRef.current = false;
        handle?.pinHover(event, null);
        scheduleLeave();
    }, [scheduleLeave, handle, event]);

    return { hover, enterCard, leaveCard };
};
