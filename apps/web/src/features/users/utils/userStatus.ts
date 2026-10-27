import { USER_STATUSES, type UserStatus } from "../consts/user-status";

/** Busy is the do not disturb status (the headphones), anything else is active. */
export const statusOfBusy = (isBusy: boolean): UserStatus => {
    if (isBusy) return USER_STATUSES.BUSY;
    return USER_STATUSES.ACTIVE;
};

/** Whether a status asks not to be disturbed. */
export const isBusyStatus = (status: UserStatus): boolean =>
    status === USER_STATUSES.BUSY;
