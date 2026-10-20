import { db, eq, userAvatarPartsTable } from "@standin/database";
import { ensureSheetUpToDate } from "./ensureSheetUpToDate";

/**
 * Active refresh after a sheet of a part was swapped, added or removed: every
 * person that uses the part gets the sheet assembled again, one at a time
 * through the queue. A failure for one person is logged and does not stop the
 * others, because the lazy refresh will try again when that person joins a
 * space. Returns how many people were visited.
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
        }
    }
    return users.length;
};
