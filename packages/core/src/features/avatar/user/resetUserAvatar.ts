import {
    db,
    eq,
    userAvatarBasesTable,
    userAvatarPartsTable,
    userAvatarSheetsTable,
} from "@standin/database";
import { resolveBaseSheetFileId } from "../sheets/resolveSheetFileId";
import { settleSheetChange } from "../sheets/settleSheetChange";

/**
 * Removes every part and the assembled sheet of the person and keeps only the
 * base they chose (null for the default one). Without parts there is nothing
 * to assemble, so the person is drawn with the sheet of the base as it is, or
 * as the ghost when there is no base at all. The old file is deleted after the
 * listeners were told.
 */
export const resetUserAvatar = async (
    userId: string,
    baseId: string | null
): Promise<void> => {
    const previousFileId = await db.transaction(async (tx) => {
        await tx
            .delete(userAvatarPartsTable)
            .where(eq(userAvatarPartsTable.userId, userId));
        await tx
            .delete(userAvatarBasesTable)
            .where(eq(userAvatarBasesTable.userId, userId));
        if (baseId !== null) {
            await tx.insert(userAvatarBasesTable).values({ userId, baseId });
        }
        const [removed] = await tx
            .delete(userAvatarSheetsTable)
            .where(eq(userAvatarSheetsTable.userId, userId))
            .returning({ fileId: userAvatarSheetsTable.fileId });
        return removed?.fileId ?? null;
    });

    const avatarSheetFileId = await resolveBaseSheetFileId(userId);
    await settleSheetChange(userId, avatarSheetFileId, previousFileId);
};
