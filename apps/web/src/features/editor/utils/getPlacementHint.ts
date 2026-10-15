import type { PlacementResult } from "@/features/editor/types/PlacementReason";
import { PLACEMENT_MESSAGES } from "@/features/editor/consts/messages";
import { describePlacementReason } from "@/features/editor/utils/describePlacementReason";

// The footer line for the spot under the cursor: the nudge when it is fine,
// the reason when it is not.
export const getPlacementHint = (result: PlacementResult): string => {
    if (result.ok) return PLACEMENT_MESSAGES.READY;
    return describePlacementReason(result.reason);
};
