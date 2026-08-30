import { mapSelect } from "../consts/select";
import { db, mapsTable, and, eq, isNull, or } from "@standin/database";
import type { MapEntity } from "@standin/contracts";

export const listMapsByOrganization = async (
    organizationId: string,
): Promise<MapEntity[]> => {
    const maps = await db
        .select(mapSelect)
        .from(mapsTable)
        .where(
            and(
                or(
                    eq(mapsTable.organizationId, organizationId),
                    isNull(mapsTable.organizationId),
                ),
                isNull(mapsTable.deletedAt),
            ),
        )
        .orderBy(mapsTable.name);

    return maps;
};
