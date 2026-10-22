import {
    SPACE_GUEST_STATUS_REASONS,
    SPACE_GUEST_STATUSES,
    SPACE_GUEST_WINDOW_HOURS,
} from "@standin/contracts";
import type { GuestRow } from "../types";

const WINDOW_MS = SPACE_GUEST_WINDOW_HOURS * 60 * 60 * 1000;

/** When a request made now stops waiting, or an admission made now stops. */
export const windowEnd = (from: Date): Date =>
    new Date(from.getTime() + WINDOW_MS);

/** A pending request or an admission past its 24h. */
export const isLapsed = (
    row: Pick<GuestRow, "status" | "expiresAt">,
    now: Date
): boolean =>
    row.status !== SPACE_GUEST_STATUSES.DENIED &&
    row.expiresAt.getTime() <= now.getTime();

/**
 * The state of a row as the world sees it. A lapsed row reads as denied by
 * timeout even before the sweeper writes that down, so no read depends on the
 * sweeper having run.
 */
export const effectiveState = (
    row: Pick<GuestRow, "status" | "statusReason" | "expiresAt">,
    now: Date
): Pick<GuestRow, "status" | "statusReason"> => {
    if (isLapsed(row, now)) {
        return {
            status: SPACE_GUEST_STATUSES.DENIED,
            statusReason: SPACE_GUEST_STATUS_REASONS.TIMEOUT,
        };
    }

    return { status: row.status, statusReason: row.statusReason };
};

/** Only an admitted guest still inside the 24h is in. */
export const hasGuestAccess = (
    row: Pick<GuestRow, "status" | "expiresAt">,
    now: Date
): boolean =>
    row.status === SPACE_GUEST_STATUSES.ADMITTED &&
    row.expiresAt.getTime() > now.getTime();

/** A request that is still waiting for a host. */
export const isWaiting = (
    row: Pick<GuestRow, "status" | "expiresAt">,
    now: Date
): boolean =>
    row.status === SPACE_GUEST_STATUSES.PENDING &&
    row.expiresAt.getTime() > now.getTime();

/** Whoever has a living pass, waiting or inside, has nothing to ask again. */
export const hasLivePass = (
    row: Pick<GuestRow, "status" | "expiresAt">,
    now: Date
): boolean => hasGuestAccess(row, now) || isWaiting(row, now);
