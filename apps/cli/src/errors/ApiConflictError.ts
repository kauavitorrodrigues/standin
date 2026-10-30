import { API_FALLBACK_CODES } from "../consts/api";
import { EXIT_CODES } from "../consts/exitCodes";
import { EXIT_HINTS_BY_CODE } from "../consts/hints";
import type { ApiFailure } from "../types";
import { readConflictDetails } from "../utils/readConflictDetails";
import { CliError } from "./CliError";

// 409 or 423: the layout changed since it was read (it carries the current
// version), or an editor holds the lock (it carries who and since when).
export class ApiConflictError extends CliError {
    constructor(failure: ApiFailure) {
        super(
            failure.message,
            failure.body.code ?? API_FALLBACK_CODES.CONFLICT,
            failure.status,
            EXIT_CODES.CONFLICT,
            {
                fix: EXIT_HINTS_BY_CODE[failure.code],
                details: readConflictDetails(failure),
            }
        );
    }
}
