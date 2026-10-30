import { EXIT_CODES } from "../consts/exitCodes";
import type { ExitCode } from "../types";

// The exit code of a domain error, by the HTTP status it carries. A status
// that is not here is an internal failure.
export const EXIT_CODE_BY_STATUS: Record<number, ExitCode> = {
    400: EXIT_CODES.VALIDATION,
    422: EXIT_CODES.VALIDATION,
    401: EXIT_CODES.AUTH,
    403: EXIT_CODES.AUTH,
    409: EXIT_CODES.CONFLICT,
};
