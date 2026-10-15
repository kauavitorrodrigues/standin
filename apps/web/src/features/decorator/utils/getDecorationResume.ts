import type { DecorationResume } from "@/features/decorator/types/decoration-resume";
import type { StoredDraft } from "@/features/maps/__shared__/types/StoredDraft";

const NONE: DecorationResume = { kind: "none" };

// What the decorator offers for the saved decoration. One with no operations
// is the same as none. It is always offered: the operations replay on the
// current state, and a replay that fails drops the decoration with a warning.
export const getDecorationResume = (
    stored: StoredDraft | null,
    currentRevision: string | null
): DecorationResume => {
    if (!stored || stored.ops.length === 0) return NONE;

    return {
        kind: "offer",
        draft: stored,
        changed: (stored.baseObjectsRevision ?? null) !== currentRevision,
        paused: stored.paused === true,
    };
};
