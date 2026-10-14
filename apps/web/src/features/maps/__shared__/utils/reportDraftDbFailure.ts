import { DRAFT_DB_MESSAGES } from "@/features/maps/__shared__/consts/messages";
import type { DraftDbResult } from "@/features/maps/__shared__/types/DraftDbResult";

// Logs the cause and returns the failed result the callers handle.
export const reportDraftDbFailure = (cause: unknown): DraftDbResult<never> => {
    console.warn(DRAFT_DB_MESSAGES.UNAVAILABLE, cause);
    return { ok: false };
};
