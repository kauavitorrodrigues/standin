import { ASSET_ACTIONS, type AssetDefinition } from "@standin/contracts";
import type { AddVariantFormValues } from "../types/addVariantForm";

// The `actionParams` of the action, built from what the editors marked.
export const buildActionParams = (
    action: AssetDefinition["action"],
    values: Pick<AddVariantFormValues, "seats" | "targetX" | "targetY">
): Record<string, unknown> | undefined => {
    if (action === ASSET_ACTIONS.SIT) return { seats: values.seats };
    if (action === ASSET_ACTIONS.TELEPORT) {
        return { targetX: values.targetX, targetY: values.targetY };
    }
    return undefined;
};
