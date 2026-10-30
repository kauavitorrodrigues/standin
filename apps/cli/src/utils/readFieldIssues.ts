import type { ErrorIssue } from "../types";

// One issue per message of each field of a body that failed its schema.
export const readFieldIssues = (
    fieldErrors: Record<string, string[]> | undefined
): ErrorIssue[] =>
    Object.entries(fieldErrors ?? {}).flatMap(([path, messages]) =>
        messages.map((message) => ({ path, message }))
    );
