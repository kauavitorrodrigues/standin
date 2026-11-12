// The availability a person shows to the others. Busy is the headphones mode.
// Away is derived from inactivity or chosen by hand (see `utils/userStatus`).
export const USER_STATUSES = {
    ACTIVE: "active",
    AWAY: "away",
    BUSY: "busy",
} as const;

export type UserStatus = (typeof USER_STATUSES)[keyof typeof USER_STATUSES];
