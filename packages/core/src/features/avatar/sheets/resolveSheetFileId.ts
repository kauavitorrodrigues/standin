import { db, eq, userAvatarSheetsTable } from "@standin/database";
import type { DbExecutor } from "../../../lib/types";
import { loadUserBase } from "./loadUserBase";

/**
 * The file of a person who has no parts: the sheet of their base drawn as it
 * is, with no assembly. Null (the ghost) when there is no base to draw.
 */
export const resolveBaseSheetFileId = async (
    userId: string,
    executor: DbExecutor = db
): Promise<string | null> => {
    const base = await loadUserBase(userId, executor);
    return base?.fileId ?? null;
};

/**
 * The file a person should be drawn with. It is the assembled sheet when they
 * have one, and else the sheet of their base (the chosen or the default one).
 * Null only when there is neither, which is the ghost. It never assembles
 * anything, see `ensureSheetUpToDate` for that.
 */
export const resolveUserSheetFileId = async (
    userId: string,
    executor: DbExecutor = db
): Promise<string | null> => {
    const [sheet] = await executor
        .select({ fileId: userAvatarSheetsTable.fileId })
        .from(userAvatarSheetsTable)
        .where(eq(userAvatarSheetsTable.userId, userId));
    if (sheet) return sheet.fileId;
    return resolveBaseSheetFileId(userId, executor);
};
