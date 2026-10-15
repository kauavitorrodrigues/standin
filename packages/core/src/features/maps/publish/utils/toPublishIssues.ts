import type { LayoutIssue, PublishIssue } from "@standin/contracts";

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
