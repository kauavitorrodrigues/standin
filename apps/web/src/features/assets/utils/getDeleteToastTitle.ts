import { ASSET_MESSAGES } from "../consts/messages";
import { DELETE_MODES, type DeleteMode } from "../consts/deleteModes";

// What the user is told after deleting an asset.
export const getDeleteToastTitle = (mode: DeleteMode): string => {
    switch (mode) {
        case DELETE_MODES.FAMILY:
            return ASSET_MESSAGES.FAMILY_DELETED;
        default:
            return ASSET_MESSAGES.ASSET_DELETED;
    }
};
