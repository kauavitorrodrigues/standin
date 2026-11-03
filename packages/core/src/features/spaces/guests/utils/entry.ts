import {
    SPACE_GUEST_LIST_STATES,
    SPACE_GUEST_STATUS_REASONS,
    SPACE_GUEST_STATUSES,
} from "@standin/contracts";
import type { SpaceGuestListState } from "@standin/contracts";
import type { GuestListStateInput, GuestRow } from "../types";
import { hasGuestAccess, isWaiting } from "./guestState";

// A closed request that ended because its time ran out, not because a host
// closed it.
const endedByTimeout = ({ statusReason }: GuestListStateInput): boolean =>
    statusReason === SPACE_GUEST_STATUS_REASONS.TIMEOUT;

const closedStateOf = (input: GuestListStateInput): SpaceGuestListState => {
    if (endedByTimeout(input)) return SPACE_GUEST_LIST_STATES.EXPIRED;
    return SPACE_GUEST_LIST_STATES.REVOKED;
};

/**
 * What a host calls a guest in the full list. Archived wins over everything, a
 * waiting request is pending, an admitted guest is active, and a closed one is
 * expired (it lapsed) or revoked (a host closed it).
 */
export const toListState = (
    input: GuestListStateInput
): SpaceGuestListState => {
    if (input.archivedAt) return SPACE_GUEST_LIST_STATES.ARCHIVED;

    switch (input.status) {
        case SPACE_GUEST_STATUSES.PENDING:
            return SPACE_GUEST_LIST_STATES.PENDING;
        case SPACE_GUEST_STATUSES.ADMITTED:
            return SPACE_GUEST_LIST_STATES.ACTIVE;
        default:
            return closedStateOf(input);
    }
};

/**
 * Only a guest who is not inside and not waiting can be archived: whoever is
 * in has to be sent out first, and a request still alive has to be answered.
 * A request past its time is not waiting any more, even before the sweeper
 * writes that down.
 */
export const canBeArchived = (
    row: Pick<GuestRow, "status" | "expiresAt">,
    now: Date
): boolean => {
    const isInside = hasGuestAccess(row, now);
    const isWaitingForAnswer = isWaiting(row, now);
    return !isInside && !isWaitingForAnswer;
};
