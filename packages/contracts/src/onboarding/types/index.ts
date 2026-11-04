import type { z } from "zod/v4";
import type {
    OnboardingEntrySchema,
    OnboardingProgressSchema,
    OnboardingResponseSchema,
    OnboardingTaskKeySchema,
} from "../schemas/onboarding.schema";

export type OnboardingTaskKey = z.infer<typeof OnboardingTaskKeySchema>;
export type OnboardingEntry = z.infer<typeof OnboardingEntrySchema>;
export type OnboardingProgress = z.infer<typeof OnboardingProgressSchema>;
export type OnboardingResponse = z.infer<typeof OnboardingResponseSchema>;
