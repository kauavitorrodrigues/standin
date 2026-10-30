import { FOLDER_ERROR_CODES, FOLDER_ERROR_NAMES } from "../consts/fs";
import type { CodedError } from "../types";

// Only the errors of reading the folder are a problem of the input; anything
// else (the core failing to load, a domain error) is not.
export const isFolderReadFailure = (error: unknown): boolean => {
    const candidate = error as CodedError | null | undefined;
    if (typeof candidate?.name === "string") {
        if (FOLDER_ERROR_NAMES[candidate.name] === true) return true;
    }
    if (typeof candidate?.code !== "string") return false;
    return FOLDER_ERROR_CODES[candidate.code] === true;
};
