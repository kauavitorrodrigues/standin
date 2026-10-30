import { ApiAuthError } from "../errors/ApiAuthError";
import { ApiConflictError } from "../errors/ApiConflictError";
import { ApiRequestFailedError } from "../errors/ApiRequestFailedError";
import { ApiValidationError } from "../errors/ApiValidationError";
import { CliError } from "../errors/CliError";
import type { ApiFailure } from "../types";

// The error class for each status that has one.
const ERROR_BY_STATUS: Record<number, (failure: ApiFailure) => CliError> = {
    400: (failure) => new ApiValidationError(failure),
    422: (failure) => new ApiValidationError(failure),
    401: (failure) => new ApiAuthError(failure),
    403: (failure) => new ApiAuthError(failure),
    409: (failure) => new ApiConflictError(failure),
    423: (failure) => new ApiConflictError(failure),
};

export const toApiError = (failure: ApiFailure): CliError => {
    const build: ((failure: ApiFailure) => CliError) | undefined =
        ERROR_BY_STATUS[failure.status];
    if (build) return build(failure);
    return new ApiRequestFailedError(failure);
};
