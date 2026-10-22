import {
    db,
    spaceGuestsTable,
    spacesTable,
    and,
    eq,
    isNull,
    lte,
    or,
} from "@standin/database";
import {
    GuestAccessDisabledError,
    SPACE_GUEST_ACCESS,
    SPACE_GUEST_STATUS_REASONS,
    SPACE_GUEST_STATUSES,
    SpaceGuestNotFoundError,
    SpaceGuestNotReopenableError,
    SpaceNotFoundError,
} from "@standin/contracts";
import type { SpaceGuest } from "@standin/contracts";
import { guestRowSelect } from "./consts/select";
import { publishSpaceGuestEvent } from "./utils/guestEvents";
import { loadGuest } from "./utils/loadGuest";
import { serializeGuestState } from "./utils/serializeGuest";
import { windowEnd } from "./utils/guestState";

/**
 * A host puts a denied or lapsed request back to waiting, with no need for the
 * guest to open the link again. Only while the space takes guests.
 */
export const resetSpaceGuest = async (
    spaceId: string,
    guestId: string
): Promise<SpaceGuest> => {
    const now = new Date();

    const [space] = await db
        .select({ guestAccess: spacesTable.guestAccess })
        .from(spacesTable)
        .where(and(eq(spacesTable.id, spaceId), isNull(spacesTable.deletedAt)));
    if (!space) throw new SpaceNotFoundError();
    if (space.guestAccess === SPACE_GUEST_ACCESS.DISABLED) {
        throw new GuestAccessDisabledError();
    }

    const [row] = await db
        .update(spaceGuestsTable)
        .set({
            status: SPACE_GUEST_STATUSES.PENDING,
            statusReason: SPACE_GUEST_STATUS_REASONS.AWAITING_RESPONSE,
            respondedBy: null,
            respondedAt: null,
            requestedAt: now,
            expiresAt: windowEnd(now),
        })
        .where(
            and(
                eq(spaceGuestsTable.id, guestId),
                eq(spaceGuestsTable.spaceId, spaceId),
                isNull(spaceGuestsTable.deletedAt),
                or(
                    eq(spaceGuestsTable.status, SPACE_GUEST_STATUSES.DENIED),
                    lte(spaceGuestsTable.expiresAt, now)
                )
            )
        )
        .returning(guestRowSelect);

    if (!row) {
        const [existing] = await db
            .select({ id: spaceGuestsTable.id })
            .from(spaceGuestsTable)
            .where(
                and(
                    eq(spaceGuestsTable.id, guestId),
                    eq(spaceGuestsTable.spaceId, spaceId),
                    isNull(spaceGuestsTable.deletedAt)
                )
            );
        if (!existing) throw new SpaceGuestNotFoundError();
        throw new SpaceGuestNotReopenableError();
    }

    const guest = await loadGuest(spaceId, guestId);
    await publishSpaceGuestEvent({ type: "requested", guest });
    await publishSpaceGuestEvent({
        type: "status",
        userId: row.userId,
        state: serializeGuestState(row, now),
    });
    return guest;
};
