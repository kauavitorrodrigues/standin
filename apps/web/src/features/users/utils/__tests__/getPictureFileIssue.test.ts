import { describe, expect, it } from "vitest";
import { PROFILE_PICTURE } from "@standin/contracts";
import { PROFILE_PICTURE_MESSAGES } from "../../consts/messages";
import { getPictureFileIssue } from "../getPictureFileIssue";

const file = (type: string, size = 10) => {
    const result = new File(["x"], "photo", { type });
    Object.defineProperty(result, "size", { value: size });
    return result;
};

describe("getPictureFileIssue", () => {
    it.each(PROFILE_PICTURE.acceptedMimeTypes)("lets %s go on", (type) => {
        expect(getPictureFileIssue(file(type))).toBeNull();
    });

    it("refuses a format the server does not take", () => {
        expect(getPictureFileIssue(file("image/gif"))).toBe(
            PROFILE_PICTURE_MESSAGES.FORMAT_NOT_ACCEPTED
        );
        expect(getPictureFileIssue(file("application/pdf"))).toBe(
            PROFILE_PICTURE_MESSAGES.FORMAT_NOT_ACCEPTED
        );
    });

    it("refuses a file over the limit and takes one exactly at it", () => {
        expect(
            getPictureFileIssue(file("image/png", PROFILE_PICTURE.maxBytes + 1))
        ).toBe(PROFILE_PICTURE_MESSAGES.FILE_TOO_LARGE);
        expect(
            getPictureFileIssue(file("image/png", PROFILE_PICTURE.maxBytes))
        ).toBeNull();
    });
});
