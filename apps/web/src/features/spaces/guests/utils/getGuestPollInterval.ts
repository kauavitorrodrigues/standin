import { SPACE_GUEST_STATUSES, type SpaceGuestState } from "@standin/contracts";

export const WAITING_POLL_MS = 15_000;

/**
 * How often the page asks for the state of the request when the socket does
 * not tell it. Only a request that is waiting needs it: once it is answered
 * there is nothing left to poll for.
 */
export const getGuestPollInterval = (
    guest: SpaceGuestState | null | undefined
): number | false => {
    if (guest?.status === SPACE_GUEST_STATUSES.PENDING) return WAITING_POLL_MS;
    return false;
};
