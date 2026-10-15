import { RESUME_DECISION } from "@/features/maps/__shared__/consts/resume-decision";
import type { ResumeDecision } from "@/features/maps/__shared__/types/ResumeDecision";
import type { StoredDraft } from "@/features/maps/__shared__/types/StoredDraft";

const NONE: ResumeDecision = { kind: RESUME_DECISION.NONE };

// Decides what the editor offers for the saved draft. A draft with no
// operations is the same as no draft. A draft from another version of the map
// can only be discarded, because there is no rebase.
export const getResumeDecision = (
    stored: StoredDraft | null,
    currentVersion: number
): ResumeDecision => {
    if (!stored || stored.ops.length === 0) return NONE;

    switch (stored.baseVersion) {
        case currentVersion:
            return { kind: RESUME_DECISION.OFFER, draft: stored };
        default:
            return { kind: RESUME_DECISION.STALE, draft: stored };
    }
};
