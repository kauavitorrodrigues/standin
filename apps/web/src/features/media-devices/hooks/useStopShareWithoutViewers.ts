import { useEffect, useRef } from "react";
import { SCREEN_SHARE_IDLE_GRACE_MS } from "@/features/media-devices/consts/videoConstraints";

type Options = {
    isSharing: boolean;
    hasViewers: boolean;
    stop: () => void;
    onStopped?: () => void;
    // Null never stops the share.
    graceMs?: number | null;
};

// Ends the screen share once it has had nobody in range for the grace
// period. Anyone coming back inside it cancels the countdown.
export function useStopShareWithoutViewers({
    isSharing,
    hasViewers,
    stop,
    onStopped,
    graceMs = SCREEN_SHARE_IDLE_GRACE_MS,
}: Options) {
    // Read through a ref so a new callback identity on every render does not
    // restart the countdown.
    const callbacksRef = useRef({ stop, onStopped });
    useEffect(() => {
        callbacksRef.current = { stop, onStopped };
    });

    useEffect(() => {
        if (!isSharing || hasViewers || graceMs === null) return;

        const timer = setTimeout(() => {
            callbacksRef.current.stop();
            callbacksRef.current.onStopped?.();
        }, graceMs);

        return () => clearTimeout(timer);
    }, [isSharing, hasViewers, graceMs]);
}
