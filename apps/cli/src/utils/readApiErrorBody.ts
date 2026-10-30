import type { ApiErrorBody } from "../types";

// The body of an error answer as the fields the CLI reads. Anything that is
// not an object (a proxy page, nothing) has none of them.
export const readApiErrorBody = (body: unknown): ApiErrorBody => {
    if (typeof body !== "object" || body === null) return {};
    return body as ApiErrorBody;
};
