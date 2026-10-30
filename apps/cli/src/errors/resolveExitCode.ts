import { BaseError } from "@standin/contracts";
import { EXIT_CODE_BY_ERROR_CODE } from "../consts/exitCodeByErrorCode";
import { EXIT_CODES } from "../consts/exitCodes";
import type { ExitCode } from "../types";
import { CliError } from "./CliError";
import { EXIT_CODE_BY_STATUS } from "./exitCodeByStatus";

export const resolveExitCode = (error: unknown): ExitCode => {
    if (error instanceof CliError) return error.exitCode;
    if (error instanceof BaseError) {
        const byCode: ExitCode | undefined =
            EXIT_CODE_BY_ERROR_CODE[error.code];
        if (byCode !== undefined) return byCode;
        return EXIT_CODE_BY_STATUS[error.status] ?? EXIT_CODES.INTERNAL;
    }
    return EXIT_CODES.INTERNAL;
};
