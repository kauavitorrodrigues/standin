import type { EmbeddedWebsiteMode } from "@standin/contracts";

// What the behavior form holds while it is being typed: the mode of the
// website and the text of the address (or of its prefix).
export type BehaviorDraft = {
    mode: EmbeddedWebsiteMode;
    text: string;
};
