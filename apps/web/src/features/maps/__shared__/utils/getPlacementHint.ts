import type { CanPlaceAssetResult } from "@standin/contracts";
import { PLACEMENT_MESSAGES } from "@/features/maps/__shared__/consts/messages";
import { describePlacementReason } from "@/features/maps/__shared__/utils/describePlacementReason";

// The footer line for the spot under the cursor: the nudge when it is fine,
// the reason when it is not.
export const getPlacementHint = (result: CanPlaceAssetResult): string => {
    if (result.ok) return PLACEMENT_MESSAGES.READY;
    return describePlacementReason(result.reason);
};
