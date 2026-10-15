import type { RESUME_DECISION } from "@/features/maps/__shared__/consts/resume-decision";
import type { StoredDraft } from "@/features/maps/__shared__/types/StoredDraft";

// What to do with the draft found in IndexedDB when the editor opens.
// `offer` lets the user resume or discard. `stale` happens when the map was
// published again since the draft started, so only discarding is possible.
export type ResumeDecision =
    | { kind: typeof RESUME_DECISION.NONE }
    | { kind: typeof RESUME_DECISION.OFFER; draft: StoredDraft }
    | { kind: typeof RESUME_DECISION.STALE; draft: StoredDraft };
