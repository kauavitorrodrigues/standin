import { db, areasTable, filesTable, and, eq } from "@standin/database";
import { liveAreaInScope } from "../../../areas/utils/scope";

/** The live global area with this key and its stored file name, or null. */
export const findAreaByKey = async (key: string) => {
    const [row] = await db
        .select({
            id: areasTable.id,
            name: areasTable.name,
            stamp: areasTable.stamp,
            fileName: filesTable.fileName,
        })
        .from(areasTable)
        .innerJoin(filesTable, eq(filesTable.id, areasTable.thumbnailFileId))
        .where(and(liveAreaInScope(null), eq(areasTable.key, key)));
    return row ?? null;
};
