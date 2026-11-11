import { EMBEDDED_WEBSITE_MODES } from "@standin/contracts";
import type { EmbeddedWebsiteParams } from "@standin/contracts";
import type { BehaviorDraft } from "@/features/editor/types/behavior-draft";

// Only the field of the chosen mode goes out, so nothing typed for the other
// one is kept.
export const fromBehaviorDraft = (
    draft: BehaviorDraft
): EmbeddedWebsiteParams => {
    const text = draft.text.trim();
    if (draft.mode === EMBEDDED_WEBSITE_MODES.URL) {
        return { mode: draft.mode, url: text };
    }

    return { mode: draft.mode, prefix: text };
};
