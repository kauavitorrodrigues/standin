import type { LayoutIssue } from "../../layout/issues";
import type { PublishIssue } from "../types/publish-issue";

// Tags the issues of the layout rules with the operation they belong to.
export const toPublishIssues = (
    opIndex: number,
    issues: LayoutIssue[]
): PublishIssue[] =>
    issues.map(({ code, path, message }) => ({
        opIndex,
        code,
        path,
        message,
    }));
