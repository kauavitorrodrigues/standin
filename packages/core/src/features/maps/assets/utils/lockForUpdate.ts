import { ASSET_PLACEMENTS } from "@standin/contracts";
import type { Transaction } from "@standin/database";
import type { Item } from "../types/item";
import type { MapInfo } from "../types/map-info";
import { lockMap } from "./lockMap";
import { lockRows } from "./lockRows";
import { readMap } from "./readMap";

/**
 * Locks what an update touches: the desks involved for a SURFACE item, the
 * whole map for anything else.
 */
export const lockForUpdate = async (
    tx: Transaction,
    mapId: string,
    current: Item,
    targetParentId: string | null
): Promise<MapInfo> => {
    if (current.placement !== ASSET_PLACEMENTS.SURFACE) {
        return lockMap(tx, mapId);
    }

    const rowIds = [current.parentId, targetParentId, current.rowId].filter(
        (id): id is string => Boolean(id)
    );
    await lockRows(tx, rowIds);

    return readMap(tx, mapId);
};
