import type { LibrarySeedReference } from "@standin/contracts";
import type { SeedKeyIds, SeedStamp, SeedStampResolution } from "../types";

/**
 * Swaps the tileset and asset keys of a stamp for ids. Every unknown key is
 * collected, so one run lists all of them.
 */
export const replaceStampKeys = (
    stamp: SeedStamp,
    tilesetIds: SeedKeyIds,
    assetIds: SeedKeyIds
): SeedStampResolution => {
    const missing: LibrarySeedReference[] = [];
    const palette = stamp.palette.map(({ tilesetKey, ...tile }, index) => {
        const tilesetId = tilesetIds.get(tilesetKey);
        if (!tilesetId) {
            missing.push({
                field: `stamp.palette[${index}].tilesetKey`,
                key: tilesetKey,
            });
        }
        return { ...tile, tilesetId: tilesetId ?? "" };
    });
    const objects = stamp.objects.map(({ assetKey, ...object }, index) => {
        const assetId = assetIds.get(assetKey);
        if (!assetId) {
            missing.push({
                field: `stamp.objects[${index}].assetKey`,
                key: assetKey,
            });
        }
        return { ...object, assetId: assetId ?? "" };
    });
    return { palette, objects, missing };
};
