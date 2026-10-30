import { mapsTable, and, eq, isNull } from "@standin/database";
import type { Transaction } from "@standin/database";
import { MapNotFoundError } from "@standin/contracts";
import { ROW_LOCK_MODES } from "../../../../lib/consts/locks";
import type { RowLockMode } from "../../../../lib/types";

// Locks the map row for the whole publish and answers its layout version. A
// dry run asks for a shared lock, so dry runs never wait for each other.
export const lockMapForPublish = async (
    tx: Transaction,
    mapId: string,
    mode: RowLockMode = ROW_LOCK_MODES.UPDATE
): Promise<number> => {
    const [map] = await tx
        .select({ layoutVersion: mapsTable.layoutVersion })
        .from(mapsTable)
        .where(and(eq(mapsTable.id, mapId), isNull(mapsTable.deletedAt)))
        .for(mode);

    if (!map) throw new MapNotFoundError();
    return map.layoutVersion;
};
