import { describe, expect, it } from "vitest";
import { BaseError } from "../../errors/base";
import { PROFILE_PICTURE } from "../consts/profile-picture";
import {
    ProfilePictureInvalidError,
    ProfilePictureTooLargeError,
    ProfilePictureUnsupportedMediaError,
    UserNotFoundError,
} from "../errors";
import { ProfilePictureFileValidationSchema } from "../schemas/profile-picture-file.schema";

describe("profile picture errors", () => {
    it.each([
        [new ProfilePictureInvalidError(), "PROFILE_PICTURE_INVALID", 422],
        [new ProfilePictureTooLargeError(), "PROFILE_PICTURE_TOO_LARGE", 413],
        [
            new ProfilePictureUnsupportedMediaError(),
            "PROFILE_PICTURE_UNSUPPORTED_MEDIA",
            415,
        ],
    ])("%o carries its code and status", (error, code, status) => {
        expect(error).toBeInstanceOf(BaseError);
        expect(error.code).toBe(code);
        expect(error.status).toBe(status);
        expect(error.message.length).toBeGreaterThan(0);
    });
});

describe("UserNotFoundError", () => {
    it("carries its code and status", () => {
        const error = new UserNotFoundError();

        expect(error).toBeInstanceOf(BaseError);
        expect([error.code, error.status]).toEqual(["USER_NOT_FOUND", 404]);
    });
});

describe("PROFILE_PICTURE", () => {
    it("has no maximum side and caps the file at 5 MB", () => {
        expect(PROFILE_PICTURE).not.toHaveProperty("maxSide");
        expect(PROFILE_PICTURE.maxBytes).toBe(5 * 1024 * 1024);
        expect(PROFILE_PICTURE.outputSize).toBe(256);
        expect(PROFILE_PICTURE.minSide).toBe(32);
    });
});

describe("ProfilePictureFileValidationSchema", () => {
    it.each(PROFILE_PICTURE.acceptedMimeTypes)("accepts %s", (mimetype) => {
        expect(
            ProfilePictureFileValidationSchema.safeParse({ mimetype, size: 10 })
                .success
        ).toBe(true);
    });

    it("refuses another mime type and a file over the size", () => {
        expect(
            ProfilePictureFileValidationSchema.safeParse({
                mimetype: "image/gif",
                size: 10,
            }).success
        ).toBe(false);
        expect(
            ProfilePictureFileValidationSchema.safeParse({
                mimetype: "image/png",
                size: PROFILE_PICTURE.maxBytes + 1,
            }).success
        ).toBe(false);
    });
});
