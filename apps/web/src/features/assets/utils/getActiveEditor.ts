import { ASSET_ACTION_BEHAVIOR } from "../consts/actionBehavior";
import type { CreateAssetAction } from "../consts/actionMeta";
import { VARIANT_EDITORS, type VariantEditor } from "../consts/variantEditors";

type Params = {
    action: CreateAssetAction;
    // The tab the user picked last.
    picked: VariantEditor;
    hasCrop: boolean;
};

// The editor of a new asset that is open. The seats only exist for an action
// that has them, and are marked on the piece, so they wait for its crop.
export const getActiveEditor = ({
    action,
    picked,
    hasCrop,
}: Params): VariantEditor => {
    if (!ASSET_ACTION_BEHAVIOR[action].hasSeats)
        return VARIANT_EDITORS.FOOTPRINT;
    if (!hasCrop) return VARIANT_EDITORS.FOOTPRINT;
    return picked;
};
