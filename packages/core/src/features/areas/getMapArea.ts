import { db, areasTable, and, eq, isNull } from "@standin/database";
import { AreaNotFoundError } from "@standin/contracts";
import type { MapAreaStamp } from "@standin/contracts";
import { paletteScopeOf, visibleAreas } from "../assets/palette";
import type { MapAccess } from "../maps/types/map-access";

/**
 * The stamp of an area the map may place: the same visibility as the palette
 * (a template map sees only the global areas). A deleted area is not found.
 */
export const getMapArea = async (
    access: MapAccess,
    areaId: string
): Promise<MapAreaStamp> => {
    const [row] = await db
        .select({
            id: areasTable.id,
            name: areasTable.name,
            stamp: areasTable.stamp,
            updatedAt: areasTable.updatedAt,
        })
        .from(areasTable)
        .where(
            and(
                eq(areasTable.id, areaId),
                isNull(areasTable.deletedAt),
                visibleAreas(paletteScopeOf(access))
            )
        );
    if (!row) throw new AreaNotFoundError();

    return {
        id: row.id,
        name: row.name,
        stamp: row.stamp,
        version: row.updatedAt.getTime(),
    };
};
