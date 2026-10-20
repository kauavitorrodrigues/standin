import { PNG } from "pngjs";
import { describe, expect, it } from "vitest";
import {
    AVATAR_PART_MAX_BYTES,
    AVATAR_SHEET_PX,
    AvatarSheetInvalidFormatError,
    AvatarSheetInvalidSizeError,
    AvatarSheetTooLargeError,
} from "@standin/contracts";
import { encodeRgbaPng } from "../../../../lib/encodeRgbaPng";
import { validateAvatarSheet } from "../validateAvatarSheet";
import { sheetPixels, sheetPng } from "./fixtures";

const rgbPng = (width: number, height: number): Buffer => {
    const png = new PNG({ width, height });
    png.data = Buffer.alloc(width * height * 4, 255);
    return PNG.sync.write(png, {
        colorType: 2,
        inputColorType: 6,
        inputHasAlpha: true,
    });
};

describe("validateAvatarSheet", () => {
    it("accepts a PNG with the exact size and RGBA", () => {
        const result = validateAvatarSheet(sheetPng());

        expect(result.rgba).toHaveLength(
            AVATAR_SHEET_PX.w * AVATAR_SHEET_PX.h * 4
        );
        expect(result.warnings).toEqual([]);
    });

    it("accepts a fully transparent sheet", () => {
        const result = validateAvatarSheet(sheetPng([0, 0, 0, 0]));

        expect(result.warnings).toEqual([]);
    });

    it("refuses bytes that are not a PNG", () => {
        expect(() =>
            validateAvatarSheet(Buffer.from("not a png at all, just text"))
        ).toThrow(AvatarSheetInvalidFormatError);
    });

    it("refuses a PNG with the wrong size", () => {
        const wrong = encodeRgbaPng(32, 32, new Uint8Array(32 * 32 * 4));

        expect(() => validateAvatarSheet(wrong)).toThrow(
            AvatarSheetInvalidSizeError
        );
    });

    it("refuses a PNG that is not RGBA", () => {
        expect(() =>
            validateAvatarSheet(rgbPng(AVATAR_SHEET_PX.w, AVATAR_SHEET_PX.h))
        ).toThrow(AvatarSheetInvalidFormatError);
    });

    it("refuses a file above the byte limit before reading it", () => {
        const big = Buffer.concat([
            sheetPng(),
            Buffer.alloc(AVATAR_PART_MAX_BYTES),
        ]);

        expect(() => validateAvatarSheet(big)).toThrow(
            AvatarSheetTooLargeError
        );
    });

    it("refuses a PNG with a valid header and a broken body", () => {
        const broken = Buffer.from(sheetPng());
        broken.fill(0, 41, broken.length - 12);

        expect(() => validateAvatarSheet(broken)).toThrow(
            AvatarSheetInvalidFormatError
        );
    });

    it("warns about partial alpha without refusing", () => {
        const pixels = sheetPixels([10, 20, 30, 255]);
        pixels[3] = 128;
        const png = encodeRgbaPng(AVATAR_SHEET_PX.w, AVATAR_SHEET_PX.h, pixels);

        const result = validateAvatarSheet(png);

        expect(result.warnings).toEqual([
            { sheet: "front", code: "ALPHA_INTERMEDIATE" },
        ]);
    });
});
