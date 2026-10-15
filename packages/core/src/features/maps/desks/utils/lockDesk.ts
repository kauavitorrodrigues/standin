import { ROW_LOCK_MODES } from "../../../../lib/consts/locks";
import {
    mapAssetsTable,
    assetsTable,
    and,
    eq,
    isNull,
} from "@standin/database";
import { ASSET_TYPES, DeskNotFoundError } from "@standin/contracts";
import type { Transaction } from "@standin/database";
import { lockedDeskSelect } from "../consts/select";
import type { SpaceRef } from "../../../spaces/types/space-ref";

/**
 * Locks the desk row and checks it is a DESK of the space's map (that the desk
 * belongs to the map of the space is validated here, not by the database).
 */
export const lockDesk = async (
    tx: Transaction,
    space: Pick<SpaceRef, "mapId">,
    mapAssetId: string
) => {
    const [desk] = await tx
        .select(lockedDeskSelect)
        .from(mapAssetsTable)
        .innerJoin(assetsTable, eq(assetsTable.id, mapAssetsTable.assetId))
        .where(
            and(
                eq(mapAssetsTable.id, mapAssetId),
                eq(mapAssetsTable.mapId, space.mapId),
                eq(assetsTable.type, ASSET_TYPES.DESK),
                isNull(mapAssetsTable.deletedAt)
            )
        )
        .for(ROW_LOCK_MODES.UPDATE, { of: mapAssetsTable });

    if (!desk) throw new DeskNotFoundError();
};
