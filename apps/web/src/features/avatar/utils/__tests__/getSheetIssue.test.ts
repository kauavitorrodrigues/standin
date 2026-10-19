import { describe, expect, it } from "vitest";
import { AVATAR_PART_MAX_BYTES, AVATAR_SHEET_PX } from "@standin/contracts";
import { AVATAR_PART_VALIDATION_MESSAGES as Messages } from "../../consts/messages";
import { PNG_HEADER, PNG_SIGNATURE } from "../../consts/partForms";
import { getSheetIssue } from "../admin/getSheetIssue";
import { parsePngHeader } from "../admin/readPngHeader";

const buildHeader = (
    width: number,
    height: number,
    bitDepth: number = PNG_HEADER.EIGHT_BITS,
    colorType: number = PNG_HEADER.RGBA_COLOR_TYPE
): Uint8Array => {
    const bytes = new Uint8Array(PNG_HEADER.LENGTH);
    bytes.set(PNG_SIGNATURE, 0);
    const view = new DataView(bytes.buffer);
    view.setUint32(PNG_HEADER.WIDTH_OFFSET, width);
    view.setUint32(PNG_HEADER.HEIGHT_OFFSET, height);
    bytes[PNG_HEADER.BIT_DEPTH_OFFSET] = bitDepth;
    bytes[PNG_HEADER.COLOR_TYPE_OFFSET] = colorType;
    return bytes;
};

describe("parsePngHeader", () => {
    it("reads the size, the bit depth and the color type", () => {
        const header = parsePngHeader(buildHeader(192, 192));
        expect(header).toEqual({
            width: 192,
            height: 192,
            bitDepth: 8,
            colorType: 6,
        });
    });

    it("returns null when the signature is not a PNG", () => {
        const bytes = buildHeader(192, 192);
        bytes[1] = 0;
        expect(parsePngHeader(bytes)).toBeNull();
    });

    it("returns null when the file is too short", () => {
        expect(parsePngHeader(new Uint8Array(8))).toBeNull();
    });
});

describe("getSheetIssue", () => {
    const valid = () =>
        parsePngHeader(buildHeader(AVATAR_SHEET_PX.w, AVATAR_SHEET_PX.h));

    it("accepts a sheet with the grid size and RGBA", () => {
        expect(getSheetIssue(1024, valid())).toBeNull();
    });

    it("refuses a file above the limit", () => {
        expect(getSheetIssue(AVATAR_PART_MAX_BYTES + 1, valid())).toBe(
            Messages.TOO_LARGE
        );
    });

    it("accepts a file exactly at the limit", () => {
        expect(getSheetIssue(AVATAR_PART_MAX_BYTES, valid())).toBeNull();
    });

    it("refuses what is not a PNG", () => {
        expect(getSheetIssue(1024, null)).toBe(Messages.NOT_PNG);
    });

    it("refuses a PNG with no alpha channel", () => {
        const rgb = parsePngHeader(
            buildHeader(AVATAR_SHEET_PX.w, AVATAR_SHEET_PX.h, 8, 2)
        );
        expect(getSheetIssue(1024, rgb)).toBe(Messages.NOT_RGBA);
    });

    it("refuses a PNG of 16 bits per channel", () => {
        const deep = parsePngHeader(
            buildHeader(AVATAR_SHEET_PX.w, AVATAR_SHEET_PX.h, 16, 6)
        );
        expect(getSheetIssue(1024, deep)).toBe(Messages.NOT_RGBA);
    });

    it("refuses a PNG of another size", () => {
        const wrong = parsePngHeader(buildHeader(AVATAR_SHEET_PX.w, 10));
        expect(getSheetIssue(1024, wrong)).toBe(Messages.WRONG_SIZE);
    });
});
