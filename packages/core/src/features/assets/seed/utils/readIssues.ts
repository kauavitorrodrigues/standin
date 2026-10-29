import {
    AreaValidationError,
    LibraryValidationError,
} from "@standin/contracts";
import type { BaseError, LibrarySeedIssue } from "@standin/contracts";

/** The issues a refusal carries, empty when it has only a message. */
export const readIssues = (error: BaseError): LibrarySeedIssue[] => {
    if (
        error instanceof LibraryValidationError ||
        error instanceof AreaValidationError
    ) {
        return error.errors.map(({ code, path, message }) => ({
            code,
            path,
            message,
        }));
    }
    return [];
};
