import { EXIT_CODE_BY_STATUS } from "../errors/exitCodeByStatus";
import type { ExitCode } from "../types";
import { EXIT_CODES } from "./exitCodes";

// The exit code of an answer of the API that is not covered by a class of its
// own. A map or a token that does not exist, or a body that is too large, is
// a problem of the input.
export const EXIT_CODE_BY_API_STATUS: Record<number, ExitCode> = {
    ...EXIT_CODE_BY_STATUS,
    404: EXIT_CODES.VALIDATION,
    413: EXIT_CODES.VALIDATION,
    // A gateway in front of the API that does not get an answer: like an
    // instance that cannot be reached.
    502: EXIT_CODES.NETWORK,
    503: EXIT_CODES.NETWORK,
    504: EXIT_CODES.NETWORK,
};
