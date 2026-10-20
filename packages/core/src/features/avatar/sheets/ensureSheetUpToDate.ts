import { db, eq, userAvatarSheetsTable } from "@standin/database";
import { assembleUserSheet } from "./assembleUserSheet";
import { computeConfigHash } from "./computeConfigHash";
import { loadSheetSources } from "./loadSheetSources";
import { loadUserBase } from "./loadUserBase";
import { resolveBaseSheetFileId } from "./resolveSheetFileId";
import { saveUserSheet } from "./saveUserSheet";

/**
 * Lazy refresh of a stale sheet. Compares the stored `config_hash` with the
 * one the current parts on the current base would give and assembles again
 * when they differ (a part or the base was swapped, or the grid version
 * changed). A person without parts is never assembled: they are drawn with the
 * sheet of their base as it is, or as the ghost when there is no base.
 * Returns the id of the file the person should be drawn with, or null for the
 * ghost.
 */
export const ensureSheetUpToDate = async (
    userId: string
): Promise<string | null> => {
    const sources = await loadSheetSources(userId);
    if (sources.length === 0) return resolveBaseSheetFileId(userId);

    const [base, [sheet]] = await Promise.all([
        loadUserBase(userId),
        db
            .select({
                fileId: userAvatarSheetsTable.fileId,
                configHash: userAvatarSheetsTable.configHash,
            })
            .from(userAvatarSheetsTable)
            .where(eq(userAvatarSheetsTable.userId, userId)),
    ]);
    if (sheet && computeConfigHash(sources, base) === sheet.configHash) {
        return sheet.fileId;
    }

    const assembled = await assembleUserSheet(sources, base);
    return saveUserSheet({ userId, sheet: assembled });
};
