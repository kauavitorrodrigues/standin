import { v7 as uuidv7 } from "uuid";
import { db, mapAssetsTable } from "@standin/database";
import type { PlaceMapAssetSchemaType, PlacedAsset } from "@standin/contracts";
import type { MapAccess } from "../types/map-access";
import { assertCanModify } from "./utils/assertCanModify";
import { assertObjectLimit } from "./utils/assertObjectLimit";
import { assertPlacementPosition } from "./utils/assertPlacementPosition";
import { buildBundleParts } from "./utils/buildBundleParts";
import { findAssetDef } from "./utils/findAssetDef";
import { findItem } from "./utils/findItem";
import { listItems } from "./utils/listItems";
import { lockForPlacement } from "./utils/lockForPlacement";
import { toFootprint } from "./utils/toFootprint";
import { toPlaced } from "./utils/toPlaced";

/**
 * Places an object. A bundle (a desk with its chairs) also creates its parts
 * in the same transaction, each linked to the root by `parent_id`.
 */
export const placeMapAsset = async (
    access: MapAccess,
    userId: string,
    input: PlaceMapAssetSchemaType
): Promise<PlacedAsset[]> => {
    return db.transaction(async (tx) => {
        const organizationId = access.owner.organizationId;
        const asset = await findAssetDef(tx, input.assetId, organizationId);
        const map = await lockForPlacement(
            tx,
            access.mapId,
            asset,
            input.parentId
        );

        const items = await listItems(tx, access.mapId);
        assertObjectLimit(items.length, 1);

        const parent = input.parentId
            ? await findItem(tx, access.mapId, input.parentId)
            : null;
        await assertCanModify(tx, access, userId, {
            placement: asset.placement,
            parentRowId: parent?.rowId ?? null,
        });

        assertPlacementPosition(
            asset,
            toFootprint(input, asset),
            map,
            items,
            parent
        );

        const rootId = uuidv7();
        const root = {
            ...asset,
            rowId: rootId,
            assetId: asset.id,
            tileX: input.tileX,
            tileY: input.tileY,
            offsetX: input.offsetX ?? 0,
            offsetY: input.offsetY ?? 0,
            parentId: parent?.rowId ?? null,
        };
        const parts = await buildBundleParts({
            tx,
            map,
            items,
            root: { ...root, parentId: null },
            organizationId,
        });

        const inserted = await tx
            .insert(mapAssetsTable)
            .values([
                {
                    id: rootId,
                    mapId: access.mapId,
                    assetId: asset.id,
                    tileX: input.tileX,
                    tileY: input.tileY,
                    offsetX: root.offsetX,
                    offsetY: root.offsetY,
                    parentId: root.parentId,
                },
                ...parts,
            ])
            .returning();

        return inserted.map(toPlaced);
    });
};
