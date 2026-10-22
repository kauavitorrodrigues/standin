import {
    spaceGuestsTable,
    spaceInviteLinksTable,
    and,
    inArray,
    isNull,
} from "@standin/database";
import type { Transaction } from "@standin/database";
import { SPACE_GUEST_STATUSES } from "@standin/contracts";
import { publishSpaceGuestEvent } from "./utils/guestEvents";

export type RemovedGuest = { spaceId: string; userId: string };

/**
 * Closes the links and the guests of spaces that are being deleted. Returns who
 * was in or waiting, so the caller tells the sockets once the transaction
 * commits, see `publishGuestsRemoved`.
 */
export const deleteSpaceGuestsBySpaceIds = async (
    spaceIds: string[],
    tx: Transaction
): Promise<RemovedGuest[]> => {
    if (spaceIds.length === 0) return [];

    const now = new Date();
    await tx
        .update(spaceInviteLinksTable)
        .set({ deletedAt: now })
        .where(
            and(
                inArray(spaceInviteLinksTable.spaceId, spaceIds),
                isNull(spaceInviteLinksTable.deletedAt)
            )
        );

    const guests = await tx
        .update(spaceGuestsTable)
        .set({ deletedAt: now })
        .where(
            and(
                inArray(spaceGuestsTable.spaceId, spaceIds),
                isNull(spaceGuestsTable.deletedAt)
            )
        )
        .returning({
            spaceId: spaceGuestsTable.spaceId,
            userId: spaceGuestsTable.userId,
            status: spaceGuestsTable.status,
        });

    return guests
        .filter(({ status }) => status !== SPACE_GUEST_STATUSES.DENIED)
        .map(({ spaceId, userId }) => ({ spaceId, userId }));
};

/** Tells the sockets that these guests are out. Runs after the commit. */
export const publishGuestsRemoved = async (
    removed: RemovedGuest[]
): Promise<void> => {
    for (const { spaceId, userId } of removed) {
        await publishSpaceGuestEvent({ type: "removed", spaceId, userId });
    }
};
