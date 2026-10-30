import { API_FALLBACK_CODES } from "../consts/api";
import { EXIT_CODES } from "../consts/exitCodes";
import type { ApiFailure } from "../types";
import { readApiIssues } from "../utils/readApiIssues";
import { CliError } from "./CliError";

// 400 or 422: the server refused the input and listed what is wrong.
export class ApiValidationError extends CliError {
    constructor(failure: ApiFailure) {
        super(
            failure.message,
            failure.body.code ?? API_FALLBACK_CODES.VALIDATION,
            failure.status,
            EXIT_CODES.VALIDATION,
            { issues: readApiIssues(failure.body) }
        );
    }
}
