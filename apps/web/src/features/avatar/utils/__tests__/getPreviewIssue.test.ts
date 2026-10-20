import { describe, expect, it } from "vitest";
import { AVATAR_PART_MAX_BYTES } from "@standin/contracts";
import { AVATAR_PART_VALIDATION_MESSAGES as Messages } from "../../consts/messages";
import { getPreviewIssue } from "../admin/getPreviewIssue";

const header = { width: 10, height: 10, bitDepth: 8, colorType: 2 };

describe("getPreviewIssue", () => {
    it("accepts any PNG within the limit, with no grid or alpha rule", () => {
        expect(getPreviewIssue(1000, header)).toBeNull();
    });

    it("refuses a file that is not a PNG", () => {
        expect(getPreviewIssue(1000, null)).toBe(Messages.PREVIEW_NOT_PNG);
    });

    it("refuses a file over the limit", () => {
        expect(getPreviewIssue(AVATAR_PART_MAX_BYTES + 1, header)).toBe(
            Messages.PREVIEW_TOO_LARGE
        );
    });
});
