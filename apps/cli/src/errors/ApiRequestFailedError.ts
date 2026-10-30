import { API_FALLBACK_CODES } from "../consts/api";
import { EXIT_CODE_BY_API_STATUS } from "../consts/exitCodeByApiStatus";
import { EXIT_CODES } from "../consts/exitCodes";
import type { ApiFailure } from "../types";
import { resolveRequestFailedFix } from "../utils/resolveRequestFailedFix";
import { CliError } from "./CliError";

// Any other answer that is not a success: a missing map, a body too large, a
// server error.
export class ApiRequestFailedError extends CliError {
    constructor(failure: ApiFailure) {
        super(
            failure.message,
            failure.body.code ?? API_FALLBACK_CODES.REQUEST,
            failure.status,
            EXIT_CODE_BY_API_STATUS[failure.status] ?? EXIT_CODES.INTERNAL,
            { fix: resolveRequestFailedFix(failure) }
        );
    }
}
