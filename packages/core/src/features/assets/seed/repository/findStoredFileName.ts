import { db, filesTable, eq } from "@standin/database";

/** The stored name of the file with this id, or null when there is none. */
export const findStoredFileName = async (
    fileId: string
): Promise<string | null> => {
    const [file] = await db
        .select({ fileName: filesTable.fileName })
        .from(filesTable)
        .where(eq(filesTable.id, fileId));
    return file?.fileName ?? null;
};
