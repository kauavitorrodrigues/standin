import {
    ASSET_PLACEMENTS,
    MapAssetParentNotAllowedError,
    MapAssetSurfaceRequiredError,
} from "@standin/contracts";
import type { Transaction } from "@standin/database";
import type { AssetDef } from "../types/asset-def";
import type { MapInfo } from "../types/map-info";
import { lockMap } from "./lockMap";
import { lockRows } from "./lockRows";
import { readMap } from "./readMap";

/**
 * Takes the lock a placement needs and reads the map. Items on a desk lock
 * only that desk, so other desks are edited in parallel. Loose objects lock
 * the whole map.
 */
export const lockForPlacement = async (
    tx: Transaction,
    mapId: string,
    asset: AssetDef,
    parentId: string | undefined
): Promise<MapInfo> => {
    if (asset.placement === ASSET_PLACEMENTS.SURFACE) {
        if (!parentId) throw new MapAssetSurfaceRequiredError();

        await lockRows(tx, [parentId]);
        return readMap(tx, mapId);
    }

    if (parentId) throw new MapAssetParentNotAllowedError();

    return lockMap(tx, mapId);
};
