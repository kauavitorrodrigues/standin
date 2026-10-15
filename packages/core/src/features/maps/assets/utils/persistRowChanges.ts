import { mapAssetsTable, and, eq, inArray } from "@standin/database";
import type { PlacedAsset } from "@standin/contracts";
import type { Transaction } from "@standin/database";
import type { RowChange } from "../types/row-change";
import { toPlaced } from "./toPlaced";

/** Writes the changes and reads the rows back as the client sees them. */
export const persistRowChanges = async (
    tx: Transaction,
    mapId: string,
    changes: RowChange[]
): Promise<PlacedAsset[]> => {
    for (const change of changes) {
        await tx
            .update(mapAssetsTable)
            .set({
                tileX: change.tileX,
                tileY: change.tileY,
                offsetX: change.offsetX,
                offsetY: change.offsetY,
                parentId: change.parentId,
                ...(change.assetId ? { assetId: change.assetId } : {}),
            })
            .where(eq(mapAssetsTable.id, change.id));
    }

    const updated = await tx
        .select()
        .from(mapAssetsTable)
        .where(
            and(
                eq(mapAssetsTable.mapId, mapId),
                inArray(
                    mapAssetsTable.id,
                    changes.map(({ id }) => id)
                )
            )
        );

    return updated.map(toPlaced);
};
