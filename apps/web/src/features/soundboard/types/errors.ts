import { BaseError } from "@standin/contracts";

export class SoundboardClipLoadError extends BaseError {
    constructor() {
        super("The clip could not be loaded.", "SOUNDBOARD_CLIP_LOAD", 502);
    }
}

export class SoundboardContextMissingError extends BaseError {
    constructor() {
        super(
            "The tile is used outside a soundboard screen.",
            "SOUNDBOARD_CONTEXT_MISSING",
            500
        );
    }
}

export class SoundboardEncodeError extends BaseError {
    constructor() {
        super(
            "The clip could not be prepared for upload.",
            "SOUNDBOARD_ENCODE_FAILED",
            500
        );
    }
}

export class SoundboardSourceTooLargeError extends BaseError {
    constructor() {
        super(
            "The file is too large to open in the editor.",
            "SOUNDBOARD_SOURCE_TOO_LARGE",
            400
        );
    }
}

export class SoundboardSourceUndecodableError extends BaseError {
    constructor() {
        super(
            "This audio could not be read. The file may be corrupted.",
            "SOUNDBOARD_SOURCE_UNDECODABLE",
            400
        );
    }
}

export class SoundboardSourceUnsupportedError extends BaseError {
    constructor() {
        super("Upload an mp3 file.", "SOUNDBOARD_SOURCE_UNSUPPORTED", 400);
    }
}
