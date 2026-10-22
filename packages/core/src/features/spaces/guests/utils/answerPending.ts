import {
    db,
    spaceGuestsTable,
    spacesTable,
    and,
    eq,
    gt,
    inArray,
    isNull,
} from "@standin/database";
import {
    GuestAccessDisabledError,
    SPACE_GUEST_ACCESS,
    SPACE_GUEST_STATUSES,
    SpaceGuestNotFoundError,
    SpaceGuestNotPendingError,
    SpaceGuestRequestExpiredError,
} from "@standin/contracts";
import type {
    SpaceGuestStatus,
    SpaceGuestStatusReason,
} from "@standin/contracts";
import { guestRowSelect } from "../consts/select";
import type { GuestRow } from "../types";

type Answer = {
    status: SpaceGuestStatus;
    statusReason: SpaceGuestStatusReason;
    expiresAt?: Date;
};

// The spaces that take guests right now. A request answered after the space
// turned guest access off must not survive it.
const spacesTakingGuests = () =>
    db
        .select({ id: spacesTable.id })
        .from(spacesTable)
        .where(
            and(
                eq(spacesTable.guestAccess, SPACE_GUEST_ACCESS.ALLOWED),
                isNull(spacesTable.deletedAt)
            )
        );

const findRow = async (spaceId: string, guestId: string) => {
    const [row] = await db
        .select({
            ...guestRowSelect,
            guestAccess: spacesTable.guestAccess,
        })
        .from(spaceGuestsTable)
        .innerJoin(spacesTable, eq(spacesTable.id, spaceGuestsTable.spaceId))
        .where(
            and(
                eq(spaceGuestsTable.id, guestId),
                eq(spaceGuestsTable.spaceId, spaceId),
                isNull(spaceGuestsTable.deletedAt)
            )
        );

    return row;
};

/**
 * Answers a request that is still waiting. The update itself is the check, so
 * two hosts answering at once cannot both win. When nothing was updated, the
 * row says why: missing, answered already, past its 24h, or the space stopped
 * taking guests.
 */
export const answerPending = async (
    spaceId: string,
    guestId: string,
    respondedBy: string,
    answer: Answer,
    now: Date = new Date()
): Promise<GuestRow> => {
    const [updated] = await db
        .update(spaceGuestsTable)
        .set({ ...answer, respondedBy, respondedAt: now })
        .where(
            and(
                eq(spaceGuestsTable.id, guestId),
                eq(spaceGuestsTable.spaceId, spaceId),
                isNull(spaceGuestsTable.deletedAt),
                eq(spaceGuestsTable.status, SPACE_GUEST_STATUSES.PENDING),
                gt(spaceGuestsTable.expiresAt, now),
                inArray(spaceGuestsTable.spaceId, spacesTakingGuests())
            )
        )
        .returning(guestRowSelect);

    if (updated) return updated;

    const row = await findRow(spaceId, guestId);
    if (!row) throw new SpaceGuestNotFoundError();
    if (row.status !== SPACE_GUEST_STATUSES.PENDING) {
        throw new SpaceGuestNotPendingError();
    }
    if (row.guestAccess === SPACE_GUEST_ACCESS.DISABLED) {
        throw new GuestAccessDisabledError();
    }
    throw new SpaceGuestRequestExpiredError();
};
