import type { EditorOp } from "@standin/contracts";
import { createTempId } from "@/features/editor/utils/createTempId";
import type { DoorSlotPlan } from "@/features/editor/utils/doorSlots";

// The place_asset of a door plan, the same op the placement controller sends.
// The plan names the variant that fits the wall, the chosen asset is the
// fallback.
export const buildDoorPlaceOp = (
    { plan }: DoorSlotPlan,
    doorAssetId: string
): EditorOp => ({
    type: "place_asset",
    tempId: createTempId(),
    assetId: plan.asset?.id ?? doorAssetId,
    tileX: plan.tileX,
    tileY: plan.tileY,
    offsetX: plan.offsetX,
    offsetY: plan.offsetY,
});
