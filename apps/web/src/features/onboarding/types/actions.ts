import type { OnboardingTaskKey } from "@standin/contracts";

// What the page does when the person takes the primary button of a task.
export type OnboardingTaskActions = Partial<
    Record<OnboardingTaskKey, () => void>
>;
