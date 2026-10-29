import { LAYOUT_ISSUE_CODES } from "@standin/contracts";
import type { AuthoringIssue, SpecStep } from "../../types";

/**
 * Moves an issue of a builder to the spec: the path of the key it is about, or
 * of the step that raised it. A missing spawn is about the whole spec.
 */
export const locateIssue = (
    issue: AuthoringIssue,
    step: SpecStep | undefined
): AuthoringIssue => {
    if (issue.code === LAYOUT_ISSUE_CODES.SPAWN_MISSING) {
        return { ...issue, path: "spawns" };
    }

    const ref = step?.refs.find(
        ({ libraryPath }) => libraryPath === issue.path
    );
    return { ...issue, path: ref?.path ?? step?.path ?? "" };
};
