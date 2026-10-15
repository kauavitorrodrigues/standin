import { mapsTable, and, eq, isNull } from "@standin/database";
import { MapNotFoundError } from "@standin/contracts";
import type { Transaction } from "@standin/database";
import { mapInfoSelect } from "../consts/select";
import type { MapInfo } from "../types/map-info";

export const readMap = async (
    tx: Transaction,
    mapId: string
): Promise<MapInfo> => {
    const [map] = await tx
        .select(mapInfoSelect)
        .from(mapsTable)
        .where(and(eq(mapsTable.id, mapId), isNull(mapsTable.deletedAt)));

    if (!map) throw new MapNotFoundError();
    return map;
};
