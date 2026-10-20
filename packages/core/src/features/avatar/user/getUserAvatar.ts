import {
    db,
    eq,
    userAvatarBasesTable,
    userAvatarPartsTable,
} from "@standin/database";
import { AVATAR_SLOT_TABS } from "@standin/contracts";
import type { DbExecutor } from "../../../lib/types";
import { resolveUserSheetFileId } from "../sheets/resolveSheetFileId";
import type { UserAvatar } from "../types";

/**
 * The choices of the person, in the order of the editor tabs, the base they
 * chose (null for the default) and the file they are drawn with: the assembled
 * sheet, else the sheet of their base, else null for the ghost.
 */
export const getUserAvatar = async (
    userId: string,
    executor: DbExecutor = db
): Promise<UserAvatar> => {
    const [parts, [chosenBase], avatarSheetFileId] = await Promise.all([
        executor
            .select({
                slot: userAvatarPartsTable.slot,
                partId: userAvatarPartsTable.partId,
            })
            .from(userAvatarPartsTable)
            .where(eq(userAvatarPartsTable.userId, userId)),
        executor
            .select({ baseId: userAvatarBasesTable.baseId })
            .from(userAvatarBasesTable)
            .where(eq(userAvatarBasesTable.userId, userId)),
        resolveUserSheetFileId(userId, executor),
    ]);

    return {
        baseId: chosenBase?.baseId ?? null,
        parts: [...parts].sort(
            (a, b) =>
                AVATAR_SLOT_TABS.indexOf(a.slot) -
                AVATAR_SLOT_TABS.indexOf(b.slot)
        ),
        avatarSheetFileId,
    };
};
