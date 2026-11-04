import { ONBOARDING_TASKS, type OnboardingTaskKey } from "@standin/contracts";

// The order the checklist shows the items in.
export const ONBOARDING_TASK_ORDER: readonly OnboardingTaskKey[] = [
    ONBOARDING_TASKS.CLAIM_DESK,
    ONBOARDING_TASKS.PERSONALIZE_AVATAR,
    ONBOARDING_TASKS.NAVIGATE_OFFICE,
    ONBOARDING_TASKS.CUSTOMIZE_OFFICE,
    ONBOARDING_TASKS.HANG_OUT,
];
