import { useEffect, useState } from "react";

// Keeps something mounted for `exitMs` after it stops being wanted, so it can
// play an exit animation before it disappears. `isExiting` is true during
// that window.
export function usePresence(isPresent: boolean, exitMs: number) {
    const [isMounted, setIsMounted] = useState(isPresent);

    // Mounting is derived while rendering (the sanctioned pattern), so the
    // first frame of an enter animation is never skipped.
    if (isPresent && !isMounted) setIsMounted(true);

    useEffect(() => {
        if (isPresent) return;

        const timeoutId = setTimeout(() => setIsMounted(false), exitMs);
        return () => clearTimeout(timeoutId);
    }, [isPresent, exitMs]);

    return {
        isMounted: isPresent || isMounted,
        isExiting: !isPresent && isMounted,
    };
}
