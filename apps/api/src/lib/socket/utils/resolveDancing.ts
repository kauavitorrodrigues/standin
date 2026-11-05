import type { DanceBefore, DanceUpdate } from "../realtime/types";

/**
 * Whether the person is dancing after this position. The client already stops
 * on its own, but the server does not trust it: a seat ends the dance, and so
 * does a step away from the spot where it was going. Starting is free, since a
 * throttled position may carry the first step of the dance with it.
 */
export const resolveDancing = (
    previous: DanceBefore | undefined,
    next: DanceUpdate
): boolean => {
    if (!next.isDancing) return false;
    if (next.isSitting) return false;
    if (!previous?.isDancing) return true;

    return previous.x === next.x && previous.y === next.y;
};
