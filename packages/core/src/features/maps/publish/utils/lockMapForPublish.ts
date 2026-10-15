import { mapsTable, and, eq, isNull } from "@standin/database";
import type { Transaction } from "@standin/database";
import { MapNotFoundError } from "@standin/contracts";
import { ROW_LOCK_MODES } from "../../../../lib/consts/locks";

// Locks the map row for the whole publish and answers its layout version.
export const lockMapForPublish = async (
    tx: Transaction,
    mapId: string
): Promise<number> => {
    const [map] = await tx
        .select({ layoutVersion: mapsTable.layoutVersion })
        .from(mapsTable)
        .where(and(eq(mapsTable.id, mapId), isNull(mapsTable.deletedAt)))
        .for(ROW_LOCK_MODES.UPDATE);

    if (!map) throw new MapNotFoundError();
    return map.layoutVersion;
};
