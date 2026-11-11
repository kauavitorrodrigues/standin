import { db, mapAssetsTable, and, eq, isNull } from "@standin/database";

/**
 * The stored behavior params of one placed object of a map, or undefined when
 * the map has no such object. The params are null for an object that has none.
 */
export const findPlacedWebsiteParams = async (
    mapId: string,
    objectId: string
) => {
    const [row] = await db
        .select({ behaviorParams: mapAssetsTable.behaviorParams })
        .from(mapAssetsTable)
        .where(
            and(
                eq(mapAssetsTable.id, objectId),
                eq(mapAssetsTable.mapId, mapId),
                isNull(mapAssetsTable.deletedAt)
            )
        );
    return row;
};
