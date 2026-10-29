import type { AuthoringIssue, AuthoringIssueParams } from "../types";
import { AUTHORING_ISSUE_MESSAGES } from "./messages";

/** The issue of a code, with its message filled from the params. */
export const createIssue = <Code extends keyof AuthoringIssueParams>(
    code: Code,
    path: string,
    params: AuthoringIssueParams[Code]
): AuthoringIssue => ({
    code,
    path,
    message: AUTHORING_ISSUE_MESSAGES[code](params),
});
