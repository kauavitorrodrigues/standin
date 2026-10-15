import { PUBLISH_PHASE } from "@/features/editor/consts/publish-phase";
import type { EditabilityState } from "@/features/editor/types/EditabilityState";

// False once the lock is lost, and while a publish runs: an edit made during
// the publish would be lost when the base is swapped (rebase).
export const isEditable = (state: EditabilityState): boolean => {
    if (state.locked) return false;
    return state.publishPhase !== PUBLISH_PHASE.PUBLISHING;
};
