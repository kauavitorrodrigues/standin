import { PUBLISH_PHASE } from "@/features/maps/__shared__/consts/publish-phase";
import type { EditabilityState } from "@/features/maps/__shared__/types/EditabilityState";

// False once the lock is lost, and while a publish runs: an edit made during
// the publish would be lost when the base is swapped (rebase).
export const isEditable = (state: EditabilityState): boolean => {
    if (state.locked) return false;
    return state.publishPhase !== PUBLISH_PHASE.PUBLISHING;
};
