import { LIST_COMMAND_BY_TARGET } from "../consts/steps";
import { STEPS_MESSAGES } from "../consts/messages";
import type { CliError } from "../errors/CliError";
import type { StepRef, StepsProgress } from "../types";

// What to do after a step failed: the fix of the error, a word about a write
// that may have happened, and about a template that was left half made.
export const buildStepsFix = (
    cause: CliError,
    progress: StepsProgress,
    uncertain: StepRef | undefined
): string | undefined => {
    const notes: string[] = [];
    if (cause.hints.fix) notes.push(cause.hints.fix);
    if (uncertain) {
        notes.push(
            STEPS_MESSAGES.uncertain(
                uncertain.target,
                uncertain.name,
                LIST_COMMAND_BY_TARGET[uncertain.target]
            )
        );
    }
    if (progress.unfinished) {
        notes.push(
            STEPS_MESSAGES.unfinished(
                progress.unfinished.name,
                progress.unfinished.id
            )
        );
    }
    if (notes.length === 0) return undefined;
    return notes.join(" ");
};
