// The availability a person shows to the others. Away is left out for now.
export const USER_STATUSES = {
    ACTIVE: "active",
    BUSY: "busy",
} as const;

export type UserStatus = (typeof USER_STATUSES)[keyof typeof USER_STATUSES];
