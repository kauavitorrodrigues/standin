import {
    AVAILABILITIES,
    type AnnounceableAvailability,
} from "@standin/contracts";
import { USER_STATUSES, type UserStatus } from "../consts/user-status";
import type { ChosenStatus, StatusInputs } from "../types/availability";

/**
 * The status that shows. Busy comes first: a person who asked not to be
 * disturbed is not turned away by being idle. Away comes from a choice that
 * stays until they change it, or from inactivity, which ends on activity.
 */
export const resolveUserStatus = ({
    isBusy,
    isManualAway,
    isIdle,
}: StatusInputs): UserStatus => {
    if (isBusy) return USER_STATUSES.BUSY;
    if (isManualAway || isIdle) return USER_STATUSES.AWAY;
    return USER_STATUSES.ACTIVE;
};

/**
 * What choosing a status sets. Only away is kept as a choice. Choosing busy
 * replaces a manual away, and leaving busy returns to active.
 */
export const chooseStatus = (status: UserStatus): ChosenStatus => {
    switch (status) {
        case USER_STATUSES.BUSY:
            return { isBusy: true, isManualAway: false };
        case USER_STATUSES.AWAY:
            return { isBusy: false, isManualAway: true };
        default:
            return { isBusy: false, isManualAway: false };
    }
};

/** Whether a status asks not to be disturbed. */
export const isBusyStatus = (status: UserStatus): boolean =>
    status === USER_STATUSES.BUSY;

/**
 * What the server is told. Busy is not sent: the others learn it from the
 * headphones, which already travel with the privacy modes.
 */
export const announcedAvailability = (
    status: UserStatus
): AnnounceableAvailability => {
    if (status === USER_STATUSES.AWAY) return AVAILABILITIES.AWAY;
    return AVAILABILITIES.ACTIVE;
};
