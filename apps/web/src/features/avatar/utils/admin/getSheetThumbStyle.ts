import type { CSSProperties } from "react";
import { AVATAR, AVATAR_SHEET_PX } from "@standin/contracts";

// Shows the first frame of a sheet, whole, in a box of `box` px, without a
// canvas. The scale is a whole number so the pixel art stays sharp.
export const getSheetThumbStyle = (url: string, box: number): CSSProperties => {
    const { w, h } = AVATAR.frame;
    const scale = Math.max(1, Math.floor(box / Math.max(w, h)));
    return {
        width: w * scale,
        height: h * scale,
        backgroundImage: `url(${url})`,
        backgroundSize: `${AVATAR_SHEET_PX.w * scale}px ${AVATAR_SHEET_PX.h * scale}px`,
        backgroundPosition: "0px 0px",
        imageRendering: "pixelated",
    };
};
