import { z } from "zod/v4";
import { ONBOARDING_TASK_KEYS } from "../consts/tasks";

export const OnboardingTaskKeySchema = z.enum(ONBOARDING_TASK_KEYS);

export const OnboardingEntrySchema = z.object({
    completedAt: z.iso.datetime(),
});

// Only the tasks that were completed have a key.
export const OnboardingProgressSchema = z.partialRecord(
    OnboardingTaskKeySchema,
    OnboardingEntrySchema
);

export const OnboardingResponseSchema = z.object({
    tasks: OnboardingProgressSchema,
});
