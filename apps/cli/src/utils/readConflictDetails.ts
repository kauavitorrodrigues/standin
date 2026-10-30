import type { ApiFailure, ErrorDetails } from "../types";

// The facts a conflict carries: the current version of a stale layout, or who
// holds the lock and since when.
export const readConflictDetails = (failure: ApiFailure): ErrorDetails => {
    const details: ErrorDetails = {};
    if (failure.body.version !== undefined) {
        details.version = failure.body.version;
    }
    if (failure.body.by) details.by = failure.body.by;
    if (failure.body.since) details.since = failure.body.since;
    return details;
};
