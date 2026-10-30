import { ApiNetworkError } from "../../errors/ApiNetworkError";
import { CliError } from "../../errors/CliError";
import { StepsFailedError } from "../../errors/StepsFailedError";
import { UnexpectedStepError } from "../../errors/UnexpectedStepError";
import type { StepRef, StepsProgress } from "../../types";
import { buildStepsFix } from "../../utils/buildStepsFix";

// Runs a command that writes in steps. When one fails, the error is given
// back with what was already done (and what is left), so it is never a
// mystery what stays on the instance. A failure that is not the CLI's own
// (a bug, an answer of an unexpected shape) is reported the same way, as the
// internal error. When the connection failed while a write was on its way, the
// write is named as uncertain: it may have happened.
export const withProgress = async <Result>(
    progress: StepsProgress,
    run: () => Promise<Result>
): Promise<Result> => {
    try {
        return await run();
    } catch (error) {
        let cause: CliError = new UnexpectedStepError(error);
        if (error instanceof CliError) cause = error;

        let uncertain: StepRef | undefined;
        if (cause instanceof ApiNetworkError) uncertain = progress.writing;
        throw new StepsFailedError(
            cause,
            progress,
            buildStepsFix(cause, progress, uncertain),
            uncertain
        );
    }
};
