import { AUTHORING_ISSUE_CODES, createIssue } from "../../issues";
import type { AuthoringIssue, Spec } from "../../types";

/** An issue for every room whose key an earlier room already has. */
export const findDuplicateRoomKeys = (spec: Spec): AuthoringIssue[] => {
    const seen = new Set<string>();
    const issues: AuthoringIssue[] = [];

    for (const [index, { key }] of (spec.rooms ?? []).entries()) {
        if (seen.has(key)) {
            issues.push(
                createIssue(
                    AUTHORING_ISSUE_CODES.SPEC_DUPLICATE_ROOM_KEY,
                    `rooms[${index}].key`,
                    { key }
                )
            );
        }
        seen.add(key);
    }

    return issues;
};
