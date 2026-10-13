import { db, filesTable, tilesetsTable, eq, inArray } from "@standin/database";
import type { DbExecutor } from "../../../lib/types";
import { tilesetSelect } from "../../assets/consts/select";

// Tilesets are loaded by id regardless of `deleted_at`: a deleted tileset
// must keep rendering in the maps that already use it.
export const loadTilesetRows = async (
    tilesetIds: string[],
    executor: DbExecutor = db
) => {
    if (tilesetIds.length === 0) return [];

    return executor
        .select(tilesetSelect)
        .from(tilesetsTable)
        .innerJoin(filesTable, eq(filesTable.id, tilesetsTable.fileId))
        .where(inArray(tilesetsTable.id, tilesetIds));
};
