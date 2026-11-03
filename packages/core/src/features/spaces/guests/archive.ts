import { db, spaceGuestsTable, and, eq, isNull } from "@standin/database";
import {
    SpaceGuestNotArchivableError,
    SpaceGuestNotFoundError,
} from "@standin/contracts";
import { guestRowSelect } from "./consts/select";
import { canBeArchived } from "./utils/entry";
import { publishGuestListChanged } from "./utils/guestEvents";

/**
 * A host moves a guest who is not inside out of the active lists. The row stays,
 * so the history is kept and the guest can still ask again. The row is locked
 * while it is checked, so a guest admitted or asking again at that moment is
 * not archived under them.
 */
export const archiveSpaceGuest = async (
    spaceId: string,
    guestId: string
): Promise<void> => {
    await db.transaction(async (tx) => {
        const [row] = await tx
            .select(guestRowSelect)
            .from(spaceGuestsTable)
            .where(
                and(
                    eq(spaceGuestsTable.id, guestId),
                    eq(spaceGuestsTable.spaceId, spaceId),
                    isNull(spaceGuestsTable.deletedAt)
                )
            )
            .for("update");
        if (!row) throw new SpaceGuestNotFoundError();

        const now = new Date();
        if (!canBeArchived(row, now)) throw new SpaceGuestNotArchivableError();

        await tx
            .update(spaceGuestsTable)
            .set({ archivedAt: now })
            .where(eq(spaceGuestsTable.id, guestId));
    });

    await publishGuestListChanged(spaceId);
};
