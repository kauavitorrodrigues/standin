import type { ApiErrorBody, ApiFailure } from "../types";
import { readApiErrorBody } from "../utils/readApiErrorBody";

// The answer of an error read once: the message and the code of the server, or
// ones made from the status when it sent none.
export const toApiFailure = (status: number, body: unknown): ApiFailure => {
    const read: ApiErrorBody = readApiErrorBody(body);
    return {
        status,
        code: read.code ?? `HTTP_${status}`,
        message: read.error ?? `The server answered ${status}.`,
        body: read,
    };
};
