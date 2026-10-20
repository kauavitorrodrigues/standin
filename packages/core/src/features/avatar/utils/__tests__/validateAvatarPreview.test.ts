import { describe, expect, it } from "vitest";
import {
    AVATAR_PART_MAX_BYTES,
    AvatarPreviewInvalidError,
    AvatarSheetTooLargeError,
} from "@standin/contracts";
import { encodeRgbaPng } from "../../../../lib/encodeRgbaPng";
import { validateAvatarPreview } from "../validateAvatarPreview";

const png = (width: number, height: number): Buffer =>
    encodeRgbaPng(width, height, new Uint8Array(width * height * 4));

describe("validateAvatarPreview", () => {
    it("accepts a PNG of any size", () => {
        expect(() => validateAvatarPreview(png(24, 24))).not.toThrow();
        expect(() => validateAvatarPreview(png(7, 130))).not.toThrow();
    });

    it("refuses bytes that are not a PNG", () => {
        expect(() =>
            validateAvatarPreview(Buffer.from("not a png at all, just text"))
        ).toThrow(AvatarPreviewInvalidError);
    });

    it("refuses an empty buffer", () => {
        expect(() => validateAvatarPreview(Buffer.alloc(0))).toThrow(
            AvatarPreviewInvalidError
        );
    });

    it("refuses a file above the byte limit", () => {
        expect(() =>
            validateAvatarPreview(Buffer.alloc(AVATAR_PART_MAX_BYTES + 1))
        ).toThrow(AvatarSheetTooLargeError);
    });
});
