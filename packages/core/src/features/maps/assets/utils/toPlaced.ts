import type { PlacedAsset } from "@standin/contracts";
import type { PlacedRow } from "../types/placed-row";

export const toPlaced = (row: PlacedRow): PlacedAsset => ({
    id: row.id,
    assetId: row.assetId,
    tileX: row.tileX,
    tileY: row.tileY,
    parentId: row.parentId,
    propertyOverrides: row.propertyOverrides,
});
