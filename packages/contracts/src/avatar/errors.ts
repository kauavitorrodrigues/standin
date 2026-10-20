import { BaseError } from "../errors/base";

export class AvatarPartNotFoundError extends BaseError {
    constructor() {
        super("Avatar part not found.", "AVATAR_PART_NOT_FOUND", 404);
    }
}

// The part does not exist, is deleted, or belongs to another slot.
export class AvatarPartInvalidError extends BaseError {
    constructor() {
        super(
            "The avatar part is invalid for this slot.",
            "AVATAR_PART_INVALID",
            422
        );
    }
}

export class AvatarSheetInvalidSizeError extends BaseError {
    constructor() {
        super(
            "The avatar sheet does not have the expected size.",
            "AVATAR_SHEET_INVALID_SIZE",
            422
        );
    }
}

export class AvatarSheetInvalidFormatError extends BaseError {
    constructor() {
        super(
            "The avatar sheet must be a PNG image with transparency (RGBA).",
            "AVATAR_SHEET_INVALID_FORMAT",
            415
        );
    }
}

export class AvatarSheetTooLargeError extends BaseError {
    constructor() {
        super(
            "The avatar sheet is larger than the allowed size.",
            "AVATAR_SHEET_TOO_LARGE",
            413
        );
    }
}

export class AvatarPartKeyTakenError extends BaseError {
    constructor() {
        super(
            "An avatar part with this key already exists.",
            "AVATAR_PART_KEY_TAKEN",
            409
        );
    }
}

// The variation has only one of colorKey and colorHex, or a malformed one.
export class AvatarVariationInvalidError extends BaseError {
    constructor() {
        super(
            "The avatar variation is invalid.",
            "AVATAR_VARIATION_INVALID",
            422
        );
    }
}

export class AvatarVariationColorTakenError extends BaseError {
    constructor() {
        super(
            "This part already has a variation with this color.",
            "AVATAR_VARIATION_COLOR_TAKEN",
            409
        );
    }
}

export class AvatarBaseNotFoundError extends BaseError {
    constructor() {
        super("Avatar base not found.", "AVATAR_BASE_NOT_FOUND", 404);
    }
}

// The base does not exist or is deleted.
export class AvatarBaseInvalidError extends BaseError {
    constructor() {
        super("The avatar base is invalid.", "AVATAR_BASE_INVALID", 422);
    }
}

export class AvatarBaseKeyTakenError extends BaseError {
    constructor() {
        super(
            "An avatar base with this key already exists.",
            "AVATAR_BASE_KEY_TAKEN",
            409
        );
    }
}

// The default base is what people without a choice use, so it cannot be
// deleted until another base takes the place.
export class AvatarBaseDefaultDeleteError extends BaseError {
    constructor() {
        super(
            "The default avatar base cannot be deleted.",
            "AVATAR_BASE_DEFAULT_DELETE",
            409
        );
    }
}

export class AvatarCategoryNotFoundError extends BaseError {
    constructor() {
        super("Avatar category not found.", "AVATAR_CATEGORY_NOT_FOUND", 404);
    }
}

export class AvatarPreviewInvalidError extends BaseError {
    constructor() {
        super(
            "The avatar preview must be a PNG image.",
            "AVATAR_PREVIEW_INVALID",
            415
        );
    }
}

export class AvatarPartCursorInvalidError extends BaseError {
    constructor() {
        super(
            "The avatar parts cursor is invalid.",
            "AVATAR_PART_CURSOR_INVALID",
            400
        );
    }
}
