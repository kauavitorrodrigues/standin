import type { PlacedAsset } from "@standin/contracts";

export const hasPlacedChanged = (
    before: PlacedAsset,
    after: PlacedAsset
): boolean =>
    before.assetId !== after.assetId ||
    before.tileX !== after.tileX ||
    before.tileY !== after.tileY ||
    before.offsetX !== after.offsetX ||
    before.offsetY !== after.offsetY ||
    before.parentId !== after.parentId;
