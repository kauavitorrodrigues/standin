import { EMBEDDED_WEBSITE_MODES } from "@standin/contracts";
import type { EmbeddedWebsiteParams } from "@standin/contracts";
import type { BehaviorDraft } from "@/features/editor/types/behavior-draft";

export const toBehaviorDraft = (
    params: EmbeddedWebsiteParams | null
): BehaviorDraft => {
    if (!params) return { mode: EMBEDDED_WEBSITE_MODES.URL, text: "" };

    return {
        mode: params.mode,
        text:
            params.mode === EMBEDDED_WEBSITE_MODES.URL
                ? params.url
                : params.prefix,
    };
};
