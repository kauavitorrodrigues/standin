import { db, spaceGuestsTable, and, eq, isNull } from "@standin/database";
import {
    SPACE_GUEST_STATUS_REASONS,
    SPACE_GUEST_STATUSES,
    SpaceGuestNotAdmittedError,
} from "@standin/contracts";
import type { SpaceGuest } from "@standin/contracts";
import { guestRowSelect } from "./consts/select";
import {
    publishGuestListChanged,
    publishSpaceGuestEvent,
} from "./utils/guestEvents";
import { loadGuest } from "./utils/loadGuest";
import { serializeGuestState } from "./utils/serializeGuest";

/**
 * A host sends an admitted guest out. The only thing that acts on an admitted
 * guest: a kick is a denial with its own reason. The row
 * stays, so the guest can ask again.
 */
export const removeSpaceGuest = async (
    spaceId: string,
    guestId: string,
    hostId: string
): Promise<SpaceGuest> => {
    const now = new Date();
    const [row] = await db
        .update(spaceGuestsTable)
        .set({
            status: SPACE_GUEST_STATUSES.DENIED,
            statusReason: SPACE_GUEST_STATUS_REASONS.KICKED,
            respondedBy: hostId,
            respondedAt: now,
        })
        .where(
            and(
                eq(spaceGuestsTable.id, guestId),
                eq(spaceGuestsTable.spaceId, spaceId),
                isNull(spaceGuestsTable.deletedAt),
                eq(spaceGuestsTable.status, SPACE_GUEST_STATUSES.ADMITTED)
            )
        )
        .returning(guestRowSelect);

    if (!row) {
        // Missing, or not admitted: those two answer differently.
        await loadGuest(spaceId, guestId);
        throw new SpaceGuestNotAdmittedError();
    }

    await publishSpaceGuestEvent({
        type: "status",
        userId: row.userId,
        state: serializeGuestState(row, now),
    });
    await publishSpaceGuestEvent({
        type: "removed",
        spaceId,
        userId: row.userId,
    });
    await publishGuestListChanged(spaceId);
    return loadGuest(spaceId, guestId);
};
