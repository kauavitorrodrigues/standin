import {
    LOCAL_AUDIO_STREAM_ERRORS,
    type LocalAudioStreamError,
} from "@/features/media-devices/consts/audioError";

const DENIED_ERROR_NAMES = new Set([
    "NotAllowedError",
    "PermissionDeniedError",
]);
const NOT_FOUND_ERROR_NAMES = new Set([
    "NotFoundError",
    "DevicesNotFoundError",
]);

export function classifyMediaError(err: unknown): LocalAudioStreamError {
    if (err instanceof DOMException) {
        if (DENIED_ERROR_NAMES.has(err.name))
            return LOCAL_AUDIO_STREAM_ERRORS.DENIED;
        if (NOT_FOUND_ERROR_NAMES.has(err.name))
            return LOCAL_AUDIO_STREAM_ERRORS.NOT_FOUND;
    }
    return LOCAL_AUDIO_STREAM_ERRORS.UNKNOWN;
}

// Not a DOMException (per spec, getUserMedia rejects with its own
// OverconstrainedError interface instead) - checked by name rather than
// `instanceof OverconstrainedError` since that global constructor isn't
// implemented by every browser.
export function isOverconstrainedError(err: unknown): boolean {
    return (
        typeof err === "object" &&
        err !== null &&
        "name" in err &&
        (err as { name: unknown }).name === "OverconstrainedError"
    );
}
