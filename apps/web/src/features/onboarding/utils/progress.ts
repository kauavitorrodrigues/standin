import type { OnboardingProgress, OnboardingTaskKey } from "@standin/contracts";
import { ONBOARDING_TASK_ORDER } from "../consts/tasks";

export const isTaskDone = (
    progress: OnboardingProgress | undefined,
    key: OnboardingTaskKey
): boolean => progress?.[key] !== undefined;

export const countDoneTasks = (
    progress: OnboardingProgress | undefined
): number =>
    ONBOARDING_TASK_ORDER.filter((key) => isTaskDone(progress, key)).length;

export const areAllTasksDone = (
    progress: OnboardingProgress | undefined
): boolean => countDoneTasks(progress) === ONBOARDING_TASK_ORDER.length;

// Keeps the first completion time, like the server does.
export const withTaskDone = (
    progress: OnboardingProgress | undefined,
    key: OnboardingTaskKey,
    completedAt: string
): OnboardingProgress => {
    if (isTaskDone(progress, key)) return progress ?? {};
    return { ...progress, [key]: { completedAt } };
};
