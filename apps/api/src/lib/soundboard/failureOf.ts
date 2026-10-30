import {
    BaseError,
    SoundboardCooldownError,
    SoundboardClipNotFoundError,
} from "@standin/contracts";
import type { PlaybackFailure } from "./types";

// A refusal the server knows travels as its code. Anything else is logged and
// answered like a clip that is not there, so no detail leaks.
export const failureOf = (error: unknown): PlaybackFailure => {
    if (error instanceof SoundboardCooldownError) {
        return {
            ok: false,
            code: error.code,
            retryAfterMs: error.retryAfterMs,
        };
    }
    if (error instanceof BaseError) return { ok: false, code: error.code };

    console.error(error);
    return { ok: false, code: new SoundboardClipNotFoundError().code };
};
