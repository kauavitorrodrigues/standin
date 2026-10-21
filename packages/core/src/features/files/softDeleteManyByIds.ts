import { filesTable, inArray, isNull, and } from "@standin/database";
import type { Transaction } from "@standin/database";

/**
 * Soft deletes the rows inside the caller's transaction and returns the
 * storage keys of the objects they pointed at. Nothing leaves storage here:
 * the caller purges the keys with `purgeStorageKeys` only after its
 * transaction commits, so a rollback never loses an object a row still needs.
 */
export const softDeleteFilesByIds = async (
    ids: string[],
    tx: Transaction
): Promise<string[]> => {
    if (ids.length === 0) return [];

    const files = await tx
        .update(filesTable)
        .set({ deletedAt: new Date() })
        .where(and(inArray(filesTable.id, ids), isNull(filesTable.deletedAt)))
        .returning({ fileName: filesTable.fileName });

    return files.map(({ fileName }) => fileName);
};
