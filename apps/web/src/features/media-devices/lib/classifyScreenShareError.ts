import {
    SCREEN_SHARE_ERRORS,
    type ScreenShareError,
} from "@/features/media-devices/consts/videoError";

// getDisplayMedia rejects with NotAllowedError both when the person closes
// the picker and when the browser blocks the request, and the two cannot be
// told apart. Closing the picker is by far the common case and is not a
// failure worth reporting, so it (and an aborted request) is treated as
// "nothing happened" instead of an error.
const CANCELLED_ERROR_NAMES = new Set(["NotAllowedError", "AbortError"]);

export const classifyScreenShareError = (
    err: unknown
): ScreenShareError | null => {
    if (err instanceof DOMException) {
        if (CANCELLED_ERROR_NAMES.has(err.name)) return null;
        if (err.name === "NotSupportedError") {
            return SCREEN_SHARE_ERRORS.UNSUPPORTED;
        }
    }

    return SCREEN_SHARE_ERRORS.UNKNOWN;
};
