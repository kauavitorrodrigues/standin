import {
    EXIT_HINTS_BY_CODE,
    NOT_FOUND_FIX,
    UNAVAILABLE_FIX,
} from "../consts/hints";
import type { ApiFailure } from "../types";

const NOT_FOUND_STATUS: number = 404;
const UNAVAILABLE_STATUSES: Record<number, true> = {
    502: true,
    503: true,
    504: true,
};

// What to do about an answer with no class of its own. A 404 with no code of
// the server is most likely a wrong id or a URL that is not the API.
export const resolveRequestFailedFix = (
    failure: ApiFailure
): string | undefined => {
    const byCode: string | undefined = EXIT_HINTS_BY_CODE[failure.code];
    if (byCode) return byCode;
    if (UNAVAILABLE_STATUSES[failure.status] === true) return UNAVAILABLE_FIX;
    if (failure.status !== NOT_FOUND_STATUS) return undefined;
    if (failure.body.code) return undefined;
    return NOT_FOUND_FIX;
};
