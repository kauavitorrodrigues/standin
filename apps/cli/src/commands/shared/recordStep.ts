import type { StepAction, StepRef, StepsProgress } from "../../types";

// A step that wrote is done: the progress remembers it for a failure.
export const recordStep = (
    progress: StepsProgress,
    step: StepRef,
    action: StepAction,
    id?: string
): void => {
    progress.done.push({ ...step, action, id });
};
