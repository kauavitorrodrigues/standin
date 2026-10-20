import { AVATAR_FRAME_KINDS } from "@standin/contracts";
import { SIT_LIFT_PX } from "../../consts/sheet-art";
import { resolveStride } from "./resolveStride";
import type { SheetFrame } from "./sheetCanvas";

const EMOTE_HOP_PX = 3;
const RUN_FLIGHT_PX = 1;

// How many px a frame is raised inside the frame of the sheet. A sitting
// figure is raised over the seat, a run leaves the ground between strides, an
// emote hops on every other frame and a standing frame dips on every other
// one, so the idle is not a still picture.
export const resolveFrameLift = (frame: SheetFrame): number => {
    const isOddStep = frame.step % 2 === 1;

    switch (frame.kind) {
        case AVATAR_FRAME_KINDS.SIT_LEGS:
        case AVATAR_FRAME_KINDS.SIT_CROSSED:
            return SIT_LIFT_PX;
        case AVATAR_FRAME_KINDS.EMOTE:
            return isOddStep ? EMOTE_HOP_PX : 0;
        case AVATAR_FRAME_KINDS.RUN:
            return resolveStride(frame.step) === null ? RUN_FLIGHT_PX : 0;
        case AVATAR_FRAME_KINDS.IDLE:
            return isOddStep ? -1 : 0;
        case AVATAR_FRAME_KINDS.WALK:
            return 0;
    }
};
