import type { StepRef, StepsProgress } from "../../../types";

// A unit of the run (the library, or a template) is done as a whole.
export const removePending = (progress: StepsProgress, done: StepRef): void => {
    progress.pending = (progress.pending ?? []).filter(
        (unit) => unit.target !== done.target || unit.name !== done.name
    );
};
