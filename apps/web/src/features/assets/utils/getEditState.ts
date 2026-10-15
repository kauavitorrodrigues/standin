import {
    ASSET_EDIT_STATES,
    IN_USE_EDITABLE_FIELDS,
    type AssetEditState,
} from "../consts/editStates";
import type { EditAssetFormValues } from "../types/editForm";

export const getAssetEditState = (asset: {
    inUse: boolean;
}): AssetEditState => {
    if (asset.inUse) return ASSET_EDIT_STATES.IN_USE;
    return ASSET_EDIT_STATES.EDITABLE;
};

// An asset in use only lets name, promptText and category change.
export const isEditFieldLocked = (
    state: AssetEditState,
    field: keyof EditAssetFormValues
): boolean =>
    state === ASSET_EDIT_STATES.IN_USE &&
    !(IN_USE_EDITABLE_FIELDS as readonly string[]).includes(field);
