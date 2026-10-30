import type { ErrorDetails, StepRef, StepsProgress } from "../types";
import { CliError } from "./CliError";

// A command that writes in steps failed in one of them. It is the error of
// the step (same code, status and exit code) plus what was already done, so a
// run is never silent about the work that stays on the instance.
export class StepsFailedError extends CliError {
    constructor(
        cause: CliError,
        progress: StepsProgress,
        fix: string | undefined,
        uncertain: StepRef | undefined
    ) {
        const details: ErrorDetails = {
            ...cause.hints.details,
            completed: progress.done,
        };
        if (progress.pending) details.pending = progress.pending;
        if (progress.unfinished) details.unfinished = progress.unfinished;
        if (uncertain) details.uncertain = uncertain;
        super(cause.message, cause.code, cause.status, cause.exitCode, {
            ...cause.hints,
            fix,
            details,
        });
    }
}
