import { API_FALLBACK_CODES } from "../consts/api";
import { EXIT_CODES } from "../consts/exitCodes";
import type { ApiFailure } from "../types";
import { resolveAuthFix } from "../utils/resolveAuthFix";
import { CliError } from "./CliError";

// 401 or 403: the token is wrong, revoked, expired, its owner is no longer an
// admin, or it lacks the scope the route needs. The code is the one of the
// server, so a script can tell them apart.
export class ApiAuthError extends CliError {
    constructor(failure: ApiFailure) {
        super(
            failure.message,
            failure.body.code ?? API_FALLBACK_CODES.AUTH,
            failure.status,
            EXIT_CODES.AUTH,
            { fix: resolveAuthFix(failure.code, failure.message) }
        );
    }
}
