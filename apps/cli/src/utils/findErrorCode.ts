import { MAX_CAUSE_DEPTH } from "../consts/network";
import type { CodedError } from "../types";

// The `code` of an error or of the nearest cause that has one (a database
// driver error comes wrapped by the query layer).
export const findErrorCode = (error: unknown): string | undefined => {
    let current: unknown = error;
    for (let depth = 0; depth < MAX_CAUSE_DEPTH; depth++) {
        const candidate = current as CodedError | null | undefined;
        if (typeof candidate?.code === "string") return candidate.code;
        current = candidate?.cause;
    }
    return undefined;
};
