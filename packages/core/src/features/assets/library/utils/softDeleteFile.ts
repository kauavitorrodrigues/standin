import { db, filesTable, eq } from "@standin/database";
import type { DbExecutor } from "../../../../lib/types";

/**
 * Soft deletes the row of a file an asset replaced. The object stays in
 * storage, so a map that still caches the old url keeps working.
 */
export const softDeleteFile = async (
    fileId: string,
    executor: DbExecutor = db
): Promise<void> => {
    await executor
        .update(filesTable)
        .set({ deletedAt: new Date() })
        .where(eq(filesTable.id, fileId));
};
