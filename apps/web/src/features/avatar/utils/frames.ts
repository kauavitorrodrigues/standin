import {
    AVATAR,
    AVATAR_ANIMATIONS,
    AVATAR_FRAMES,
    AVATAR_SHEET_DIRECTIONS,
    PLAYER_DIRECTIONS,
} from "@standin/contracts";
import type { AvatarAnimation } from "@standin/contracts";
import type { PixelRect } from "../types/editor";

type Direction = (typeof AVATAR_SHEET_DIRECTIONS)[number];

const MS_PER_SECOND = 1000;

// Where the frame of an animation sits in the sheet, at a point in time.
export const resolveFrameRect = (
    animation: AvatarAnimation,
    direction: Direction,
    elapsedMs: number
): PixelRect => {
    const { fps } = AVATAR_ANIMATIONS[animation];
    const frames: readonly number[] = AVATAR_FRAMES[animation][direction];
    const step = Math.floor((elapsedMs / MS_PER_SECOND) * fps);
    const column = frames[step % frames.length];

    return {
        x: column * AVATAR.frame.w,
        y: 0,
        w: AVATAR.frame.w,
        h: AVATAR.frame.h,
    };
};

// The next direction when the preview is clicked: the avatar turns through
// the four directions in the order of the sheet.
export const rotateDirection = (direction: Direction): Direction => {
    const index = AVATAR_SHEET_DIRECTIONS.indexOf(direction);
    return AVATAR_SHEET_DIRECTIONS[
        (index + 1) % AVATAR_SHEET_DIRECTIONS.length
    ];
};

// The direction an arrow key asks for, or null for any other key.
export const getDirectionFromKey = (key: string): Direction | null => {
    switch (key) {
        case "ArrowDown":
            return PLAYER_DIRECTIONS.DOWN;
        case "ArrowLeft":
            return PLAYER_DIRECTIONS.LEFT;
        case "ArrowRight":
            return PLAYER_DIRECTIONS.RIGHT;
        case "ArrowUp":
            return PLAYER_DIRECTIONS.UP;
        default:
            return null;
    }
};
