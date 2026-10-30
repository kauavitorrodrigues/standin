import type { ErrorIssue } from "../types";

// One line for a person: where the problem is, then what it is.
export const formatIssue = (issue: ErrorIssue): string => {
    const where: string[] = [];
    if (issue.file) where.push(issue.file);
    if (issue.opIndex !== undefined) where.push(`op ${issue.opIndex}`);
    if (issue.code) where.push(issue.code);
    if (issue.path) where.push(issue.path);
    if (where.length === 0) return issue.message;
    return `${where.join(" ")}: ${issue.message}`;
};
