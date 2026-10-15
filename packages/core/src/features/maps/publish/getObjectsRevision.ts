import { mapAssetsTable, eq, max } from "@standin/database";
import type { DbExecutor } from "../../../lib/types";

/**
 * The revision of the objects of a map: the latest `updated_at` among its
 * `map_assets` rows, deleted ones included, because a soft delete touches
 * `updated_at` too. Null when the map never had an object. Tiles and the
 * layout do not move it.
 */
export const getObjectsRevision = async (
    executor: DbExecutor,
    mapId: string
): Promise<string | null> => {
    const [row] = await executor
        .select({ revision: max(mapAssetsTable.updatedAt) })
        .from(mapAssetsTable)
        .where(eq(mapAssetsTable.mapId, mapId));

    if (!row?.revision) return null;
    return new Date(row.revision).toISOString();
};
