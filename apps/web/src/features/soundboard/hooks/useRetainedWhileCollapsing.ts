import { useEffect, useState } from "react";
import { SOUNDBOARD_FOLD_DURATION_MS } from "../consts/fold";

/**
 * Whether a row still has to be drawn. A row that is open is, and one that
 * folds is for as long as its fold lasts, so the person sees it shrink. A row
 * that is folded from the start never is: a folded group of any size mounts
 * nothing.
 */
export const useRetainedWhileCollapsing = (collapsed: boolean): boolean => {
    // Folded from the start counts as a fold that is already over.
    const [settled, setSettled] = useState(collapsed);
    const [wasCollapsed, setWasCollapsed] = useState(collapsed);

    // An unfolded row is not settled: its next fold starts a new one.
    if (wasCollapsed !== collapsed) {
        setWasCollapsed(collapsed);
        if (!collapsed) setSettled(false);
    }

    useEffect(() => {
        if (!collapsed) return;
        const timer = setTimeout(
            () => setSettled(true),
            SOUNDBOARD_FOLD_DURATION_MS
        );
        return () => clearTimeout(timer);
    }, [collapsed]);

    return !collapsed || !settled;
};
