import {
    db,
    mapAssetsTable,
    deskAssignmentsTable,
    and,
    eq,
    inArray,
    isNull,
} from "@standin/database";
import {
    ASSET_PLACEMENTS,
    ASSET_TYPES,
    DeskClaimedError,
} from "@standin/contracts";
import type { MapAccess } from "../types/map-access";
import type { RemoveResult } from "./types/remove-result";
import { assertCanModify } from "./utils/assertCanModify";
import { findDeskOwner } from "./utils/findDeskOwner";
import { findItem } from "./utils/findItem";
import { listItems } from "./utils/listItems";
import { lockMap } from "./utils/lockMap";
import { lockRows } from "./utils/lockRows";

/**
 * Removes an object. SURFACE children go with it, GROUND children (bundle
 * parts) lose the link and stay. Removing a claimed desk needs
 * `releaseDesk`, which also frees the desk in the same transaction.
 */
export const removeMapAsset = async (
    access: MapAccess,
    userId: string,
    rowId: string,
    releaseDesk: boolean
): Promise<RemoveResult> => {
    return db.transaction(async (tx) => {
        const current = await findItem(tx, access.mapId, rowId);

        if (current.placement === ASSET_PLACEMENTS.SURFACE) {
            await lockRows(
                tx,
                [current.parentId, rowId].filter((id): id is string =>
                    Boolean(id)
                )
            );
        } else {
            await lockMap(tx, access.mapId);
        }

        await assertCanModify(tx, access, userId, {
            placement: current.placement,
            parentRowId: current.parentId,
        });

        const items = await listItems(tx, access.mapId);
        const children = items.filter((item) => item.parentId === rowId);
        const surfaceChildren = children.filter(
            (child) => child.placement === ASSET_PLACEMENTS.SURFACE
        );
        const groundChildren = children.filter(
            (child) => child.placement !== ASSET_PLACEMENTS.SURFACE
        );

        let releasedDeskUserId: string | null = null;
        if (current.type === ASSET_TYPES.DESK) {
            const desk = await findDeskOwner(tx, rowId);
            if (desk) {
                if (!releaseDesk) throw new DeskClaimedError();

                await tx
                    .update(deskAssignmentsTable)
                    .set({ deletedAt: new Date() })
                    .where(eq(deskAssignmentsTable.id, desk.id));
                releasedDeskUserId = desk.userId;
            }
        }

        const removedIds = [
            rowId,
            ...surfaceChildren.map((child) => child.rowId),
        ];

        await tx
            .update(mapAssetsTable)
            .set({ deletedAt: new Date() })
            .where(
                and(
                    inArray(mapAssetsTable.id, removedIds),
                    isNull(mapAssetsTable.deletedAt)
                )
            );

        const detachedIds = groundChildren.map((child) => child.rowId);
        if (detachedIds.length > 0) {
            await tx
                .update(mapAssetsTable)
                .set({ parentId: null })
                .where(inArray(mapAssetsTable.id, detachedIds));
        }

        return { removedIds, detachedIds, releasedDeskUserId };
    });
};
