import {
    mapsTable,
    mapAssetsTable,
    inArray,
    isNull,
    and,
} from "@standin/database";
import type { DbExecutor } from "../../lib/types";

export const deleteMapsByIds = async (
    ids: string[],
    tx: DbExecutor
): Promise<void> => {
    if (ids.length === 0) return;

    const deletedAt = new Date();

    await tx
        .update(mapAssetsTable)
        .set({ deletedAt })
        .where(
            and(
                inArray(mapAssetsTable.mapId, ids),
                isNull(mapAssetsTable.deletedAt)
            )
        );

    await tx
        .update(mapsTable)
        .set({ deletedAt })
        .where(and(inArray(mapsTable.id, ids), isNull(mapsTable.deletedAt)));
};
