import { DESK_MESSAGES } from "../consts/messages";

// What the card of a free desk says while the Studio holds the map, or null
// when desks can change. The name of the editor is told when it is known.
export const resolveDeskLockText = (
    isLocked: boolean,
    holderName: string | undefined
): string | null => {
    if (!isLocked) return null;

    return holderName
        ? DESK_MESSAGES.lockedBy(holderName)
        : DESK_MESSAGES.LOCKED;
};
