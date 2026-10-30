import { MISSING_FILE_CODE, UNKNOWN_CODE } from "../consts/fs";
import { FILE_PROBLEMS } from "../consts/messages";
import { findErrorCode } from "./findErrorCode";

// Why a file cannot be read, as a phrase that follows its name.
export const describeReadFailure = (error: unknown): string => {
    const code: string = findErrorCode(error) ?? UNKNOWN_CODE;
    if (code === MISSING_FILE_CODE) return FILE_PROBLEMS.missing;
    return FILE_PROBLEMS.unreadable(code);
};
