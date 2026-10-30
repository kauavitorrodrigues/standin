import { BaseError } from "@standin/contracts";
import type { CliErrorHints, ExitCode } from "../types";

// The parent of the errors of the CLI. Each one says its own exit code.
export class CliError extends BaseError {
    public readonly exitCode: ExitCode;
    public readonly hints: CliErrorHints;

    constructor(
        message: string,
        code: string,
        status: number,
        exitCode: ExitCode,
        hints: CliErrorHints = {}
    ) {
        super(message, code, status);
        this.exitCode = exitCode;
        this.hints = hints;
    }
}
