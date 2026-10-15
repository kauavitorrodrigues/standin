import { EDIT_MAP_ACTION } from "../consts/edit-map-action";
import type {
    EditMapAction,
    ResolveEditMapActionInput,
} from "../types/editMapAction";

// Who sees the Edit item and whether it works. Without permission it is
// hidden. A lock held by someone else disables it, and a lock held by the
// user (another tab, for instance) still opens normally.
export const resolveEditMapAction = ({
    canEdit,
    lock,
    userId,
}: ResolveEditMapActionInput): EditMapAction => {
    if (!canEdit) return EDIT_MAP_ACTION.HIDDEN;
    if (!lock.locked) return EDIT_MAP_ACTION.ENABLED;

    switch (lock.by?.id === userId) {
        case true:
            return EDIT_MAP_ACTION.ENABLED;
        default:
            return EDIT_MAP_ACTION.LOCKED_BY_OTHER;
    }
};
