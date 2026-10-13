import { db } from "@standin/database";
import { ASSET_PLACEMENTS } from "@standin/contracts";
import { UPDATE_KINDS } from "./consts/update-kinds";
import type { UpdateMapAssetSchemaType } from "@standin/contracts";
import type { MapAccess } from "../types/map-access";
import type { RowChange } from "./types/row-change";
import type { UpdateResult } from "./types/update-result";
import { assertColorChange } from "./utils/assertColorChange";
import { assertCanModify } from "./utils/assertCanModify";
import { assertModelFitsChildren } from "./utils/assertModelFitsChildren";
import { assertReplaceable } from "./utils/assertReplaceable";
import { findAssetDef } from "./utils/findAssetDef";
import { findItem } from "./utils/findItem";
import { listItems } from "./utils/listItems";
import { lockForUpdate } from "./utils/lockForUpdate";
import { persistRowChanges } from "./utils/persistRowChanges";
import { planGroundMove } from "./utils/planGroundMove";
import { planSurfaceMove } from "./utils/planSurfaceMove";
import { toFootprint } from "./utils/toFootprint";

/**
 * Moves an object, moves it to another desk, or swaps its model
 * (`replace_asset`, which keeps the row, the desk link and the children).
 * With `colorChange` the swap is restricted to a color sibling.
 *
 * - GROUND with children (a bundle): moving the root moves the children by the
 *   same delta. Moving a child alone detaches it.
 * - SURFACE: the destination must be a desk and the item stays inside it.
 */
export const updateMapAsset = async (
    access: MapAccess,
    userId: string,
    rowId: string,
    changes: UpdateMapAssetSchemaType
): Promise<UpdateResult> => {
    return db.transaction(async (tx) => {
        const current = await findItem(tx, access.mapId, rowId);
        const isSurface = current.placement === ASSET_PLACEMENTS.SURFACE;
        const targetParentId =
            changes.parentId === undefined
                ? current.parentId
                : changes.parentId;

        const map = await lockForUpdate(
            tx,
            access.mapId,
            current,
            targetParentId
        );
        const items = await listItems(tx, access.mapId);
        const children = items.filter((item) => item.parentId === rowId);

        const target = {
            placement: current.placement,
            parentRowId: current.parentId,
        };
        await assertCanModify(tx, access, userId, target);
        if (targetParentId !== current.parentId) {
            await assertCanModify(tx, access, userId, {
                ...target,
                parentRowId: targetParentId,
            });
        }

        const nextAsset =
            changes.assetId && changes.assetId !== current.assetId
                ? await findAssetDef(
                      tx,
                      changes.assetId,
                      access.owner.organizationId
                  )
                : null;
        if (changes.colorChange) assertColorChange(current, nextAsset);
        if (nextAsset) await assertReplaceable(tx, current, nextAsset);

        const def = nextAsset ?? current;
        const next = {
            tileX: changes.tileX ?? current.tileX,
            tileY: changes.tileY ?? current.tileY,
        };
        const footprint = toFootprint(next, def);

        let parentId = targetParentId;
        let childChanges: RowChange[] = [];

        if (isSurface) {
            planSurfaceMove(current, footprint, targetParentId, items);
        } else {
            ({ parentId, childChanges } = planGroundMove({
                current,
                def,
                next,
                requestedParentId: changes.parentId,
                items,
                children,
                map,
            }));
        }

        if (nextAsset) assertModelFitsChildren(nextAsset, footprint, children);

        const placed = await persistRowChanges(tx, access.mapId, [
            {
                id: rowId,
                ...next,
                parentId,
                ...(nextAsset ? { assetId: nextAsset.id } : {}),
            },
            ...childChanges,
        ]);

        return {
            kind: nextAsset ? UPDATE_KINDS.REPLACED : UPDATE_KINDS.MOVED,
            placed,
        };
    });
};
