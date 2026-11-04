import type { OnboardingTaskKey } from "@standin/contracts";

// One line of the checklist, already worded for its state.
export type ChecklistItem = {
    taskKey: OnboardingTaskKey;
    title: string;
    isDone: boolean;
};
