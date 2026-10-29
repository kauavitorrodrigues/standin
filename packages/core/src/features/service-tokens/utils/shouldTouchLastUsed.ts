import { LAST_USED_THROTTLE_MS } from "../consts";

export const shouldTouchLastUsed = (
    lastUsedAt: Date | null,
    now: Date
): boolean => {
    if (!lastUsedAt) return true;
    return now.getTime() - lastUsedAt.getTime() >= LAST_USED_THROTTLE_MS;
};
