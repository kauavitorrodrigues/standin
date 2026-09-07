import { mapSelect } from "./consts/select";
import { db, mapsTable, eq, and, isNull } from "@standin/database";
import { MapNotFoundError } from "@standin/contracts";
import type { MapEntity, MapUpdateSchemaType } from "@standin/contracts";

export const updateMap = async (
    organizationId: string,
    id: string,
    data: MapUpdateSchemaType
): Promise<MapEntity> => {
    const [map] = await db
        .update(mapsTable)
        .set(data)
        .where(
            and(
                eq(mapsTable.id, id),
                eq(mapsTable.organizationId, organizationId),
                isNull(mapsTable.deletedAt)
            )
        )
        .returning(mapSelect);

    if (!map) throw new MapNotFoundError();

    return map;
};
