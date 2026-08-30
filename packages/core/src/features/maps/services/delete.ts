import { mapSelect } from "../consts/select";
import { db, mapsTable, eq, and, isNull } from "@standin/database";
import { MapNotFoundError } from "@standin/contracts";
import type { MapEntity } from "@standin/contracts";

export const deleteMap = async (
    organizationId: string,
    id: string,
): Promise<MapEntity> => {
    const [map] = await db
        .update(mapsTable)
        .set({ deletedAt: new Date() })
        .where(
            and(
                eq(mapsTable.id, id),
                eq(mapsTable.organizationId, organizationId),
                isNull(mapsTable.deletedAt),
            ),
        )
        .returning(mapSelect);

    if (!map) throw new MapNotFoundError();

    return map;
};
