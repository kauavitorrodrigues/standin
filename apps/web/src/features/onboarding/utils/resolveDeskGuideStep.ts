import { DESK_GUIDE_STEPS } from "../consts/deskGuide";
import type { DeskGuideStep } from "../types/deskGuide";

type Params = {
    hasOwnDesk: boolean;
    freeDeskCount: number;
};

// Until the person has a desk the guide points at the free ones, or says there
// is none; after that it offers to walk to the new one.
export function resolveDeskGuideStep({
    hasOwnDesk,
    freeDeskCount,
}: Params): DeskGuideStep {
    if (hasOwnDesk) return DESK_GUIDE_STEPS.WALK;
    if (freeDeskCount <= 0) return DESK_GUIDE_STEPS.NONE_FREE;
    return DESK_GUIDE_STEPS.PICK;
}
