import {
    db,
    spaceGuestsTable,
    and,
    inArray,
    isNull,
    lte,
} from "@standin/database";
import {
    SPACE_GUEST_STATUS_REASONS,
    SPACE_GUEST_STATUSES,
} from "@standin/contracts";
import { guestRowSelect } from "./consts/select";
import {
    publishGuestListChanged,
    publishSpaceGuestEvent,
} from "./utils/guestEvents";
import { serializeGuestState } from "./utils/serializeGuest";

export type ExpiredGuest = {
    spaceId: string;
    userId: string;
    wasAdmitted: boolean;
};

/**
 * Writes down the requests and admissions that outlived their 24h as denied by
 * timeout, and tells the guests. The sweeper calls this on an interval. An
 * admitted guest also loses the sockets in the space.
 */
export const expireDueSpaceGuests = async (
    now: Date = new Date()
): Promise<ExpiredGuest[]> => {
    const due = await db
        .select(guestRowSelect)
        .from(spaceGuestsTable)
        .where(
            and(
                isNull(spaceGuestsTable.deletedAt),
                inArray(spaceGuestsTable.status, [
                    SPACE_GUEST_STATUSES.PENDING,
                    SPACE_GUEST_STATUSES.ADMITTED,
                ]),
                lte(spaceGuestsTable.expiresAt, now)
            )
        );
    if (due.length === 0) return [];

    // The update repeats the conditions, so a row a host answered in between
    // is left alone.
    const updated = await db
        .update(spaceGuestsTable)
        .set({
            status: SPACE_GUEST_STATUSES.DENIED,
            statusReason: SPACE_GUEST_STATUS_REASONS.TIMEOUT,
            respondedAt: now,
        })
        .where(
            and(
                inArray(
                    spaceGuestsTable.id,
                    due.map(({ id }) => id)
                ),
                inArray(spaceGuestsTable.status, [
                    SPACE_GUEST_STATUSES.PENDING,
                    SPACE_GUEST_STATUSES.ADMITTED,
                ]),
                lte(spaceGuestsTable.expiresAt, now)
            )
        )
        .returning(guestRowSelect);

    const wasAdmitted = new Set(
        due
            .filter(({ status }) => status === SPACE_GUEST_STATUSES.ADMITTED)
            .map(({ id }) => id)
    );

    const expired: ExpiredGuest[] = [];
    for (const row of updated) {
        await publishSpaceGuestEvent({
            type: "status",
            userId: row.userId,
            state: serializeGuestState(row, now),
        });
        if (wasAdmitted.has(row.id)) {
            await publishSpaceGuestEvent({
                type: "removed",
                spaceId: row.spaceId,
                userId: row.userId,
            });
        }
        expired.push({
            spaceId: row.spaceId,
            userId: row.userId,
            wasAdmitted: wasAdmitted.has(row.id),
        });
    }

    for (const spaceId of new Set(expired.map((guest) => guest.spaceId))) {
        await publishGuestListChanged(spaceId);
    }
    return expired;
};
