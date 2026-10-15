import { describe, expect, it } from "vitest";
import { LAYOUT_ISSUE_CODES } from "../issues";
import { LAYOUT_ISSUE_MESSAGES } from "../consts/issue-messages";

const NEW_CODES = [
    LAYOUT_ISSUE_CODES.CELL_OCCUPIED_BY_OBJECT,
    LAYOUT_ISSUE_CODES.CELL_BLOCKED_BY_WALL,
    LAYOUT_ISSUE_CODES.WALL_HAS_MOUNTED_OBJECT,
    LAYOUT_ISSUE_CODES.NOT_ON_SURFACE,
    LAYOUT_ISSUE_CODES.NOT_ON_WALL,
    LAYOUT_ISSUE_CODES.FOOTPRINT_OVERLAP,
    LAYOUT_ISSUE_CODES.REPLACE_INCOMPATIBLE,
    LAYOUT_ISSUE_CODES.OP_TOO_LARGE,
];

const toMessageKey = (code: string) =>
    code
        .toLowerCase()
        .replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());

describe("conflict issue codes", () => {
    it("registers every conflict code", () => {
        for (const code of NEW_CODES) {
            expect(Object.values(LAYOUT_ISSUE_CODES)).toContain(code);
        }
    });

    it.each(NEW_CODES)("%s has a fixed message", (code) => {
        const message =
            LAYOUT_ISSUE_MESSAGES[
                toMessageKey(code) as keyof typeof LAYOUT_ISSUE_MESSAGES
            ];

        expect(typeof message).toBe("string");
        expect((message as string).length).toBeGreaterThan(0);
    });
});
