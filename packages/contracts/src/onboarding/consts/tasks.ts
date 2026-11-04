// A new task is a new key here: the progress is stored as jsonb, so there is
// no enum in the database and no migration.
export const ONBOARDING_TASKS = {
    CLAIM_DESK: "claim-desk",
    PERSONALIZE_AVATAR: "personalize-avatar",
    NAVIGATE_OFFICE: "navigate-office",
    CUSTOMIZE_OFFICE: "customize-office",
    HANG_OUT: "hang-out",
} as const;

export const ONBOARDING_TASK_KEYS = Object.values(ONBOARDING_TASKS);
