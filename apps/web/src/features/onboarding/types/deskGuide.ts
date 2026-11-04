import type { DESK_GUIDE_STEPS } from "../consts/deskGuide";

export type DeskGuideStep =
    (typeof DESK_GUIDE_STEPS)[keyof typeof DESK_GUIDE_STEPS];
