import type { LibrarySeedReference } from "@standin/contracts";
import type { SeedBundle, SeedBundleResolution, SeedKeyIds } from "../types";

/**
 * Swaps the keys of a bundle for asset ids. Every key without an asset is
 * collected, so one run lists all of them.
 */
export const resolveBundleParts = (
    entry: SeedBundle,
    ids: SeedKeyIds
): SeedBundleResolution => {
    const missing: LibrarySeedReference[] = [];
    const rootId = ids.get(entry.asset);
    if (!rootId) missing.push({ field: "asset", key: entry.asset });

    const parts = entry.parts.map(({ partAsset, ...offsets }, partIndex) => {
        const partAssetId = ids.get(partAsset);
        if (!partAssetId) {
            missing.push({
                field: `parts[${partIndex}].partAsset`,
                key: partAsset,
            });
        }
        return { partAssetId: partAssetId ?? "", ...offsets };
    });
    return { rootId, parts, missing };
};
