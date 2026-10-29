import { AUTHORING_ISSUE_CODES, createIssue } from "../issues";
import type { ValidateSpecResult } from "../types";
import { findDuplicateRoomKeys } from "./internal/findDuplicateRoomKeys";
import { isEmptySpec } from "./internal/isEmptySpec";
import { toSpecIssues } from "./internal/toSpecIssues";
import { SpecSchema } from "./schemas/spec.schema";

/**
 * Checks a parsed value against the spec schema, and the rules a schema does
 * not hold (a room key is used once). Every issue has a path into the spec.
 * What needs the library (keys, the map size) is checked on compile.
 */
export const validateSpec = (input: unknown): ValidateSpecResult => {
    if (isEmptySpec(input)) {
        return {
            ok: false,
            issues: [createIssue(AUTHORING_ISSUE_CODES.SPEC_EMPTY, "", {})],
        };
    }

    const parsed = SpecSchema.safeParse(input);
    if (!parsed.success) {
        return { ok: false, issues: parsed.error.issues.flatMap(toSpecIssues) };
    }

    const duplicates = findDuplicateRoomKeys(parsed.data);
    if (duplicates.length > 0) return { ok: false, issues: duplicates };

    return { ok: true, spec: parsed.data };
};
