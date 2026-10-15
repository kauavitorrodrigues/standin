import type { z } from "zod/v4";
import {
    LAYOUT_ISSUE_CODES as Code,
    type LayoutIssueCode,
} from "../../../layout/issues";

const SIZE_KEYS: PropertyKey[] = ["width", "height"];

/** The issue code of a StampSchema failure: size and object count have their own, the rest is STAMP_INVALID. */
export const stampSchemaIssueCode = (
    issue: z.core.$ZodIssue
): LayoutIssueCode => {
    const isSize = SIZE_KEYS.includes(issue.path[0]);

    switch (issue.code) {
        case "too_small":
            return isSize ? Code.STAMP_TOO_SMALL : Code.STAMP_INVALID;
        case "too_big":
            if (isSize) return Code.STAMP_TOO_LARGE;
            return issue.path.length === 1 && issue.path[0] === "objects"
                ? Code.STAMP_TOO_MANY_OBJECTS
                : Code.STAMP_INVALID;
        default:
            return Code.STAMP_INVALID;
    }
};
