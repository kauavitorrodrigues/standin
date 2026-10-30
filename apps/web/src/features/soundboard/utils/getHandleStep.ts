import {
    SOUNDBOARD_HANDLE_BIG_STEP_MS,
    SOUNDBOARD_HANDLE_STEP_MS,
} from "../consts/trim";

/**
 * How far a key moves a handle of the selection, in milliseconds: left and
 * down go back, right and up go forward, and shift makes the step bigger.
 * Null for any other key.
 */
export const getHandleStep = (
    key: string,
    shiftKey: boolean
): number | null => {
    const step = shiftKey
        ? SOUNDBOARD_HANDLE_BIG_STEP_MS
        : SOUNDBOARD_HANDLE_STEP_MS;
    switch (key) {
        case "ArrowLeft":
        case "ArrowDown":
            return -step;
        case "ArrowRight":
        case "ArrowUp":
            return step;
        default:
            return null;
    }
};
