import { BaseError } from "../errors/base";

export class UserNotFoundError extends BaseError {
    constructor() {
        super("User not found.", "USER_NOT_FOUND", 404);
    }
}

export class UserAlreadyExistsError extends BaseError {
    constructor() {
        super(
            "An account with this email already exists.",
            "USER_ALREADY_EXISTS",
            409
        );
    }
}

// Not a real PNG, JPEG or WebP, corrupted, animated, too small or too many
// pixels.
export class ProfilePictureInvalidError extends BaseError {
    constructor() {
        super(
            "The profile picture is not a valid image.",
            "PROFILE_PICTURE_INVALID",
            422
        );
    }
}

export class ProfilePictureTooLargeError extends BaseError {
    constructor() {
        super(
            "The profile picture exceeds the maximum allowed size.",
            "PROFILE_PICTURE_TOO_LARGE",
            413
        );
    }
}

// The multipart request has no `file` field.
export class ProfilePictureUnsupportedMediaError extends BaseError {
    constructor() {
        super(
            "The profile picture must be sent as a file.",
            "PROFILE_PICTURE_UNSUPPORTED_MEDIA",
            415
        );
    }
}

// The values given to the first install (admin email, name, password or
// organization name) do not pass the same rules as the sign up. The message
// names the field and the rule, never the value.
export class BootstrapInputInvalidError extends BaseError {
    constructor(detail: string) {
        super(
            `Invalid bootstrap input: ${detail}`,
            "BOOTSTRAP_INPUT_INVALID",
            422
        );
    }
}
