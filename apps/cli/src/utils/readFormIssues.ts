import type { ErrorIssue } from "../types";

export const readFormIssues = (
    formErrors: string[] | undefined
): ErrorIssue[] => (formErrors ?? []).map((message) => ({ message }));
