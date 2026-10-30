import { BaseError } from "@standin/contracts";
import { EXIT_HINTS_BY_CODE } from "../consts/hints";
import type { ErrorReport } from "../types";
import { CliError } from "./CliError";
import { describeError } from "./describeError";

const INTERNAL_CODE = "CLI_INTERNAL";

// The error as the operator sees it. An unexpected error shows no stack and
// no raw driver message.
export const toErrorReport = (error: unknown): ErrorReport => {
    if (error instanceof CliError) {
        return {
            code: error.code,
            message: error.message,
            ...error.hints,
        };
    }
    if (error instanceof BaseError) {
        const report: ErrorReport = {
            code: error.code,
            message: error.message,
        };
        const fix: string | undefined = EXIT_HINTS_BY_CODE[error.code];
        if (fix) report.fix = fix;
        return report;
    }
    return { code: INTERNAL_CODE, message: describeError(error) };
};
