import { describe, expect, it } from "vitest";
import { BaseError } from "../../errors/base";
import {
    AvatarBaseDefaultDeleteError,
    AvatarBaseInvalidError,
    AvatarBaseKeyTakenError,
    AvatarBaseNotFoundError,
    AvatarCategoryNotFoundError,
    AvatarPartCursorInvalidError,
    AvatarPartInvalidError,
    AvatarPartKeyTakenError,
    AvatarPartNotFoundError,
    AvatarPreviewInvalidError,
    AvatarSheetInvalidFormatError,
    AvatarSheetInvalidSizeError,
    AvatarSheetTooLargeError,
    AvatarVariationColorTakenError,
    AvatarVariationInvalidError,
} from "../errors";

describe("avatar errors", () => {
    it.each([
        [new AvatarPartNotFoundError(), "AVATAR_PART_NOT_FOUND", 404],
        [new AvatarPartInvalidError(), "AVATAR_PART_INVALID", 422],
        [new AvatarSheetInvalidSizeError(), "AVATAR_SHEET_INVALID_SIZE", 422],
        [
            new AvatarSheetInvalidFormatError(),
            "AVATAR_SHEET_INVALID_FORMAT",
            415,
        ],
        [new AvatarSheetTooLargeError(), "AVATAR_SHEET_TOO_LARGE", 413],
        [new AvatarPartKeyTakenError(), "AVATAR_PART_KEY_TAKEN", 409],
        [new AvatarVariationInvalidError(), "AVATAR_VARIATION_INVALID", 422],
        [
            new AvatarVariationColorTakenError(),
            "AVATAR_VARIATION_COLOR_TAKEN",
            409,
        ],
        [new AvatarBaseNotFoundError(), "AVATAR_BASE_NOT_FOUND", 404],
        [new AvatarBaseInvalidError(), "AVATAR_BASE_INVALID", 422],
        [new AvatarBaseKeyTakenError(), "AVATAR_BASE_KEY_TAKEN", 409],
        [new AvatarBaseDefaultDeleteError(), "AVATAR_BASE_DEFAULT_DELETE", 409],
        [new AvatarCategoryNotFoundError(), "AVATAR_CATEGORY_NOT_FOUND", 404],
        [new AvatarPreviewInvalidError(), "AVATAR_PREVIEW_INVALID", 415],
        [new AvatarPartCursorInvalidError(), "AVATAR_PART_CURSOR_INVALID", 400],
    ])("%o carries its code and status", (error, code, status) => {
        expect(error).toBeInstanceOf(BaseError);
        expect(error.code).toBe(code);
        expect(error.status).toBe(status);
        expect(error.message.length).toBeGreaterThan(0);
    });
});
