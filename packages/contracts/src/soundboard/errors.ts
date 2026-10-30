import { BaseError } from "../errors/base";
import {
    SOUNDBOARD_MAX_CLIP_BYTES,
    SOUNDBOARD_MAX_DURATION_MS,
    SOUNDBOARD_MIN_DURATION_MS,
} from "./consts/limits";

export class SoundboardClipNotFoundError extends BaseError {
    constructor() {
        super("Clip not found.", "SOUNDBOARD_CLIP_NOT_FOUND", 404);
    }
}

export class SoundboardClipNameTakenError extends BaseError {
    constructor() {
        super(
            "A clip with this name already exists.",
            "SOUNDBOARD_CLIP_NAME_TAKEN",
            409
        );
    }
}

export class SoundboardClipForbiddenError extends BaseError {
    constructor() {
        super("You cannot change this clip.", "SOUNDBOARD_CLIP_FORBIDDEN", 403);
    }
}

export class SoundboardNameInvalidError extends BaseError {
    constructor() {
        super("The clip name is invalid.", "SOUNDBOARD_CLIP_NAME_INVALID", 422);
    }
}

export class SoundboardIconInvalidError extends BaseError {
    constructor() {
        super(
            "The icon must be a single emoji.",
            "SOUNDBOARD_CLIP_ICON_INVALID",
            422
        );
    }
}

export class SoundboardVolumeInvalidError extends BaseError {
    constructor() {
        super(
            "The volume must be between 0 and 1.",
            "SOUNDBOARD_CLIP_VOLUME_INVALID",
            422
        );
    }
}

export class SoundboardFileMissingError extends BaseError {
    constructor() {
        super("No clip file was sent.", "SOUNDBOARD_FILE_MISSING", 400);
    }
}

export class SoundboardFileTooLargeError extends BaseError {
    constructor() {
        super(
            `The clip must have at most ${SOUNDBOARD_MAX_CLIP_BYTES / 1024} KB.`,
            "SOUNDBOARD_FILE_TOO_LARGE",
            413
        );
    }
}

export class SoundboardUnsupportedFormatError extends BaseError {
    constructor() {
        super(
            "The clip must be a valid mp3 file.",
            "SOUNDBOARD_UNSUPPORTED_FORMAT",
            415
        );
    }
}

export class SoundboardClipTooLongError extends BaseError {
    constructor() {
        super(
            `The clip must last at most ${SOUNDBOARD_MAX_DURATION_MS / 1000} seconds.`,
            "SOUNDBOARD_CLIP_TOO_LONG",
            422
        );
    }
}

export class SoundboardClipTooShortError extends BaseError {
    constructor() {
        super(
            `The clip must last at least ${SOUNDBOARD_MIN_DURATION_MS} ms.`,
            "SOUNDBOARD_CLIP_TOO_SHORT",
            422
        );
    }
}

// Realtime refusals. They travel as codes in an ack, never as an HTTP status.
export class SoundboardCooldownError extends BaseError {
    public readonly retryAfterMs: number;

    constructor(retryAfterMs: number) {
        super(
            "Wait a moment before playing another clip.",
            "SOUNDBOARD_COOLDOWN",
            429
        );
        this.retryAfterMs = retryAfterMs;
    }
}

export class SoundboardTooManyClipsError extends BaseError {
    constructor() {
        super(
            "Too many clips are playing at once.",
            "SOUNDBOARD_TOO_MANY_CLIPS",
            429
        );
    }
}

export class SoundboardNotInSpaceError extends BaseError {
    constructor() {
        super(
            "Join a space as a member to play clips.",
            "SOUNDBOARD_NOT_IN_SPACE",
            403
        );
    }
}
