import type { CSSProperties } from "react";
import {
    AVATAR,
    AVATAR_FRAMES,
    AVATAR_SHEET_PX,
    PLAYER_DIRECTIONS,
} from "@standin/contracts";

// Cuts the first idle frame facing down out of a sheet with CSS, and places it
// inside a square of `size` px so the middle of the visible body sits at the
// center. The frame is mostly free room above the head, so centering the
// whole frame would push the body down.
export const getAvatarFrameStyle = (
    sheetUrl: string,
    scale: number,
    size: number
): CSSProperties => {
    const [column] = AVATAR_FRAMES.IDLE[PLAYER_DIRECTIONS.DOWN];
    const bodyMiddleY = AVATAR.anchor.y - AVATAR.visible.h / 2;

    return {
        left: size / 2 - AVATAR.anchor.x * scale,
        top: size / 2 - bodyMiddleY * scale,
        width: AVATAR.frame.w * scale,
        height: AVATAR.frame.h * scale,
        backgroundImage: `url(${sheetUrl})`,
        backgroundSize: `${AVATAR_SHEET_PX.w * scale}px ${AVATAR_SHEET_PX.h * scale}px`,
        backgroundPosition: `${-column * AVATAR.frame.w * scale}px 0`,
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
    };
};
