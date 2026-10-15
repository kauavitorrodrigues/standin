import { describe, expect, it } from "vitest";
import {
    LIBRARY_ISSUE_CODES,
    MAX_TILESET_IMAGE_PX,
    MAX_UPLOAD_BYTES,
    PngTooLargeError,
} from "@standin/contracts";
import { readUploadedPng } from "../readUploadedPng";
import { pngOf } from "./fixtures";

const codes = (issues: { code: string }[]) => issues.map(({ code }) => code);

describe("readUploadedPng", () => {
    it("reads the size of a valid PNG", () => {
        const result = readUploadedPng(pngOf(64, 32));

        expect(result.size).toEqual({ width: 64, height: 32 });
        expect(result.issues).toEqual([]);
    });

    it("asks for the image when the part is missing", () => {
        const result = readUploadedPng(undefined);

        expect(result.size).toBeNull();
        expect(codes(result.issues)).toEqual([
            LIBRARY_ISSUE_CODES.IMAGE_FILE_REQUIRED,
        ]);
    });

    it("refuses bytes that are not a PNG, whatever the name says", () => {
        const result = readUploadedPng(
            Buffer.from("GIF89a plain text pretending to be image.png....")
        );

        expect(codes(result.issues)).toEqual([LIBRARY_ISSUE_CODES.PNG_INVALID]);
    });

    it("refuses a buffer that only has the first 4 bytes of the signature", () => {
        const png = Buffer.from(pngOf(32, 32));
        png[4] = 0;

        expect(codes(readUploadedPng(png).issues)).toEqual([
            LIBRARY_ISSUE_CODES.PNG_INVALID,
        ]);
    });

    it("throws a 413 when the file is over the byte limit", () => {
        const big = Buffer.alloc(MAX_UPLOAD_BYTES + 1);

        expect(() => readUploadedPng(big)).toThrow(PngTooLargeError);
        expect(new PngTooLargeError().status).toBe(413);
    });

    it("refuses a side over the pixel limit", () => {
        const png = Buffer.from(pngOf(32, 32));
        png.writeUInt32BE(MAX_TILESET_IMAGE_PX + 1, 16);

        expect(codes(readUploadedPng(png).issues)).toEqual([
            LIBRARY_ISSUE_CODES.PNG_DIMENSIONS_EXCEEDED,
        ]);
    });
});
