import type { ErrorIssue } from "../types";

export const isErrorIssue = (value: unknown): value is ErrorIssue => {
    if (typeof value !== "object" || value === null) return false;
    return typeof (value as ErrorIssue).message === "string";
};
