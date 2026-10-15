import type { CSSProperties } from "react";
import { FOOTPRINT_COLOR } from "../consts/editorColors";
import {
    FOOTPRINT_OTHER_FRAME_OPACITY,
    FOOTPRINT_SOFT_TINT_PERCENT,
    FOOTPRINT_SOLID_TINT_PERCENT,
} from "../consts/editorOverlayStyle";

// The tint of the footprint: filled and strong when it blocks the way, soft
// when it does not.
const getTintPercent = (solid: boolean): number => {
    if (solid) return FOOTPRINT_SOLID_TINT_PERCENT;
    return FOOTPRINT_SOFT_TINT_PERCENT;
};

// The border of the footprint: solid when it blocks the way, dashed when it
// does not.
const getBorderStyle = (solid: boolean): CSSProperties["borderStyle"] => {
    if (solid) return "solid";
    return "dashed";
};

// The copies of the footprint on the other frames of a strip are paler.
const getOpacity = (frameIndex: number): number => {
    if (frameIndex === 0) return 1;
    return FOOTPRINT_OTHER_FRAME_OPACITY;
};

// How the footprint is drawn on one frame of the crop.
export const getFootprintBoxStyle = (
    solid: boolean,
    frameIndex: number
): CSSProperties => ({
    borderColor: FOOTPRINT_COLOR,
    borderStyle: getBorderStyle(solid),
    backgroundColor: `color-mix(in srgb, ${FOOTPRINT_COLOR} ${getTintPercent(solid)}%, transparent)`,
    opacity: getOpacity(frameIndex),
});
