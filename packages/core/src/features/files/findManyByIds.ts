import { fileSelect } from "./consts/select";
import { db, filesTable, inArray, isNull, and } from "@standin/database";
import type { File } from "@standin/contracts";

export const findFilesByIds = async (ids: string[]): Promise<File[]> => {
    if (ids.length === 0) return [];

    return db
        .select(fileSelect)
        .from(filesTable)
        .where(and(inArray(filesTable.id, ids), isNull(filesTable.deletedAt)));
};
