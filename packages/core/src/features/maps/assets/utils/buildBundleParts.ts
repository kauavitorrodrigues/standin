import { v7 as uuidv7 } from "uuid";
import {
    mapAssetsTable,
    assetPartsTable,
    and,
    eq,
    isNull,
} from "@standin/database";
import { bundlePartSelect } from "../consts/select";
import type { AssetDef } from "../types/asset-def";
import type { Item } from "../types/item";
import type { BundleInput } from "../types/bundle-input";
import { assertGroundPosition } from "./assertGroundPosition";
import { assertObjectLimit } from "./assertObjectLimit";
import { findAssetDef } from "./findAssetDef";
import { toFootprint } from "./toFootprint";

/**
 * The parts that come with a bundle (a desk with its chairs), validated like
 * any other GROUND object, each linked to the root by `parent_id`.
 */
export const buildBundleParts = async ({
    tx,
    map,
    items,
    root,
    organizationId,
}: BundleInput): Promise<(typeof mapAssetsTable.$inferInsert)[]> => {
    const parts = await tx
        .select(bundlePartSelect)
        .from(assetPartsTable)
        .where(
            and(
                eq(assetPartsTable.assetId, root.assetId),
                isNull(assetPartsTable.deletedAt)
            )
        );

    if (parts.length === 0) return [];
    assertObjectLimit(items.length, 1 + parts.length);

    const placedSoFar: Item[] = [...items, root];
    const rows: (typeof mapAssetsTable.$inferInsert)[] = [];

    for (const part of parts) {
        const partAsset: AssetDef = await findAssetDef(
            tx,
            part.partAssetId,
            organizationId
        );
        const position = {
            tileX: root.tileX + part.offsetX,
            tileY: root.tileY + part.offsetY,
        };
        assertGroundPosition(
            toFootprint(position, partAsset),
            map,
            placedSoFar
        );

        const partId = uuidv7();
        placedSoFar.push({
            ...partAsset,
            rowId: partId,
            assetId: partAsset.id,
            ...position,
            offsetX: root.offsetX,
            offsetY: root.offsetY,
            parentId: root.rowId,
        });
        rows.push({
            id: partId,
            mapId: map.id,
            assetId: partAsset.id,
            ...position,
            offsetX: root.offsetX,
            offsetY: root.offsetY,
            parentId: root.rowId,
        });
    }

    return rows;
};
