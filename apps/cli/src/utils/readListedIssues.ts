import type { ErrorIssue } from "../types";
import { isErrorIssue } from "./isErrorIssue";

// The entries of `errors` that look like an issue.
export const readListedIssues = (errors: unknown): ErrorIssue[] => {
    if (!Array.isArray(errors)) return [];
    return errors.filter(isErrorIssue);
};
