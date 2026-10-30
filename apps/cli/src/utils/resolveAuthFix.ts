import {
    AUTH_FALLBACK_FIX,
    EXIT_HINTS_BY_CODE,
    SCOPE_MISSING_CODE,
} from "../consts/hints";
import { MESSAGES } from "../consts/messages";
import { extractMissingScope } from "./extractMissingScope";

// What to do about a 401 or 403: the scope is named when it is the missing
// one, otherwise the hint of the code.
export const resolveAuthFix = (code: string, message: string): string => {
    if (code === SCOPE_MISSING_CODE) {
        const scope: string | undefined = extractMissingScope(message);
        if (scope) return MESSAGES.scopeMissingFix(scope);
    }
    return EXIT_HINTS_BY_CODE[code] ?? AUTH_FALLBACK_FIX;
};
