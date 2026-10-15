import { PUBLISH_RETRY_DELAYS_MS } from "@/features/editor/consts/publish";

// `attempt` is 1 for the first try. The last delay repeats if there are more
// attempts than delays.
export const getRetryDelay = (attempt: number): number =>
    PUBLISH_RETRY_DELAYS_MS[
        Math.min(attempt, PUBLISH_RETRY_DELAYS_MS.length) - 1
    ];
