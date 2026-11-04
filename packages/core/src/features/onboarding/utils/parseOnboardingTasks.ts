import {
    ONBOARDING_TASK_KEYS,
    OnboardingEntrySchema,
    type OnboardingProgress,
} from "@standin/contracts";

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

// Each entry is checked on its own, so one bad or retired entry never hides
// the others. Anything that is not a task today is dropped.
export const parseOnboardingTasks = (raw: unknown): OnboardingProgress => {
    if (!isRecord(raw)) return {};

    const tasks: OnboardingProgress = {};
    for (const key of ONBOARDING_TASK_KEYS) {
        if (!(key in raw)) continue;
        const entry = OnboardingEntrySchema.safeParse(raw[key]);
        if (entry.success) tasks[key] = entry.data;
    }
    return tasks;
};
