import type { PublishResult } from "@standin/contracts";
import type { DraftStore } from "@/features/maps/__shared__/lib/DraftStore";
import type { EditorStore } from "@/features/maps/__shared__/lib/EditorStore";
import type { PublishInput } from "@/features/maps/__shared__/types/publish-input";
import type { PublishAttempt } from "@/features/maps/__shared__/types/publish-attempt";
import type { ClassifiedPublishError } from "@/features/maps/__shared__/types/publish-error";

export type RunPublishDeps = {
    editorStore: EditorStore;
    draftStore: DraftStore;
    publish: (input: PublishInput) => Promise<PublishResult>;
    // Removes the saved copy of the draft.
    clearSavedDraft: () => Promise<void>;
};

export type RunPublishParams = {
    attempt: PublishAttempt;
};

export type RunPublishResult =
    | { ok: true; result: PublishResult }
    | { ok: false; failure: ClassifiedPublishError };
