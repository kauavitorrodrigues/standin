import type { PublishPhase } from "@/features/editor/types/publish-phase";

// The part of the editor state that decides whether an edit may happen.
export type EditabilityState = {
    publishPhase: PublishPhase;
    // True once the lock is lost.
    locked?: boolean;
};
