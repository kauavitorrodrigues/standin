import { AREA_STATUS_KIND } from "../consts/areaStatus";
import type { AreaStatus } from "../types/areaStatus";

type Params = { isDirty: boolean; isSaving: boolean };

// What the status badge says. A save in progress beats everything, then
// whether there is something not saved.
export const getAreaStatus = ({ isDirty, isSaving }: Params): AreaStatus => {
    if (isSaving) return AREA_STATUS_KIND.SAVING;
    if (isDirty) return AREA_STATUS_KIND.DRAFT;
    return AREA_STATUS_KIND.CLEAN;
};
