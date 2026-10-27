import { db, eq, userAvatarPartsTable } from "@standin/database";
import { ensureSheetUpToDate } from "./ensureSheetUpToDate";
import { markSheetStale } from "./staleSheets";

/**
 * Active refresh after a sheet of a part was swapped, added or removed: every
 * person that uses the part gets the sheet assembled again, one at a time
 * through the queue. A failure for one person is logged and does not stop the
 * others, because the person is marked and the sheet is assembled again, in the
 * background, when they join a space. Returns how many people were visited.
 */
export const regenerateForPart = async (partId: string): Promise<number> => {
    const users = await db
        .select({ userId: userAvatarPartsTable.userId })
        .from(userAvatarPartsTable)
        .where(eq(userAvatarPartsTable.partId, partId));

    for (const { userId } of users) {
        try {
            await ensureSheetUpToDate(userId);
        } catch (error) {
            console.error(error);
            markSheetStale(userId);
        }
    }
    return users.length;
};
