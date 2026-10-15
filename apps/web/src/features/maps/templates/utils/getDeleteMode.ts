import { MAP_TEMPLATE_STATUSES, type MapTemplate } from "@standin/contracts";
import { DELETE_MODES, type DeleteMode } from "../consts/deleteModes";

// Only a published template cannot be deleted, it has to be retired first.
export const getDeleteMode = (status: MapTemplate["status"]): DeleteMode => {
    switch (status) {
        case MAP_TEMPLATE_STATUSES.PUBLISHED:
            return DELETE_MODES.BLOCKED;
        default:
            return DELETE_MODES.ALLOWED;
    }
};
