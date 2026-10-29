import type { z } from "zod/v4";
import { AUTHORING_ISSUE_CODES as Code, createIssue } from "../../issues";
import type { AuthoringIssue } from "../../types";
import { formatSpecPath } from "./formatSpecPath";

const join = (path: string, field: string) =>
    path === "" ? field : `${path}.${field}`;

/** The structured issues of one zod issue, with a path into the spec. */
export const toSpecIssues = (found: z.core.$ZodIssue): AuthoringIssue[] => {
    const path = formatSpecPath(found.path);

    switch (found.code) {
        case "unrecognized_keys":
            return found.keys.map((field) =>
                createIssue(Code.SPEC_UNKNOWN_FIELD, join(path, field), {
                    field,
                })
            );
        case "too_small":
        case "too_big":
            return [
                createIssue(Code.SPEC_OUT_OF_RANGE, path, {
                    detail: found.message,
                }),
            ];
        case "invalid_type":
            return [
                createIssue(Code.SPEC_INVALID_TYPE, path, {
                    detail: found.message,
                }),
            ];
        default:
            return [
                createIssue(Code.SPEC_INVALID_VALUE, path, {
                    detail: found.message,
                }),
            ];
    }
};
