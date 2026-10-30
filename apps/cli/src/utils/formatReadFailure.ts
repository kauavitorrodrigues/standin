import type { ReadFailure } from "../types";

// One line for the operator out of the errors the folder reader can throw:
// a missing file (its message names it), broken JSON or a library.json that
// breaks the schema.
export const formatReadFailure = (error: unknown): string => {
    const failure = (error ?? {}) as ReadFailure;
    const [issue] = failure.issues ?? [];
    if (!issue) return failure.message ?? String(error);

    const where: string = issue.path.map(String).join(".");
    if (!where) return issue.message;
    return `${where}: ${issue.message}`;
};
