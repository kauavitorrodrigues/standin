// The availability a person shows to the others. Busy is the headphones mode.
// Away is derived from inactivity or chosen by hand (see `utils/userStatus`).
export const USER_STATUSES = {
    ACTIVE: "active",
    AWAY: "away",
    BUSY: "busy",
} as const;

// The word for each status, under the name and as the label of its dot.
export const USER_STATUS_LABELS = {
    [USER_STATUSES.ACTIVE]: "Ativo",
    [USER_STATUSES.AWAY]: "Ausente",
    [USER_STATUSES.BUSY]: "Ocupado",
} as const;

export type UserStatus = (typeof USER_STATUSES)[keyof typeof USER_STATUSES];
