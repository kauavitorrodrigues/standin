import { ROW_LOCK_MODES } from "../../../../lib/consts/locks";
import { mapsTable, and, eq, isNull } from "@standin/database";
import { MapNotFoundError } from "@standin/contracts";
import type { Transaction } from "@standin/database";
import { mapInfoSelect } from "../consts/select";
import type { MapInfo } from "../types/map-info";

// Locks the map row, for operations on loose objects.
export const lockMap = async (
    tx: Transaction,
    mapId: string
): Promise<MapInfo> => {
    const [map] = await tx
        .select(mapInfoSelect)
        .from(mapsTable)
        .where(and(eq(mapsTable.id, mapId), isNull(mapsTable.deletedAt)))
        .for(ROW_LOCK_MODES.UPDATE);

    if (!map) throw new MapNotFoundError();
    return map;
};
