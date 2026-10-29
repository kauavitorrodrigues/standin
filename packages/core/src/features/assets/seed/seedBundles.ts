import { LibrarySeedReferenceNotFoundError } from "@standin/contracts";
import { setLibraryAssetParts } from "../assets/setAssetParts";
import type { SeedBundle, SeedItem } from "./types";
import { SeedRepository } from "./repository";
import { withSeedEntry } from "./run/withSeedEntry";
import { buildBundleLabel } from "./utils/buildBundleLabel";
import { decideBundleAction } from "./utils/decideBundleAction";
import { resolveBundleParts } from "./utils/resolveBundleParts";
import { runSequentially } from "./utils/runSequentially";
import { SEED_ACTIONS } from "./types";

const GLOBAL_SCOPE = null;

const seedBundle = async (
    entry: SeedBundle,
    index: number,
    ids: Map<string, string>
): Promise<SeedItem> => {
    const label = buildBundleLabel(index, entry.asset);
    const { rootId, parts, missing } = resolveBundleParts(entry, ids);
    if (missing.length > 0 || !rootId) {
        throw new LibrarySeedReferenceNotFoundError(label, missing);
    }

    const current = await SeedRepository.findBundleParts(rootId);
    const action = decideBundleAction(current, parts);
    if (action === SEED_ACTIONS.UNCHANGED) {
        return { id: rootId, key: entry.asset, action };
    }
    await withSeedEntry(label, () =>
        setLibraryAssetParts(rootId, GLOBAL_SCOPE, { parts })
    );
    return { id: rootId, key: entry.asset, action };
};

/**
 * Applies the parts of every bundle. It runs after all assets exist, since a
 * root and its parts can both come from the same file. A bundle that lists no
 * parts clears them, a root the file does not mention is left alone.
 */
export const seedBundles = async (
    entries: SeedBundle[]
): Promise<SeedItem[]> => {
    const keys = entries.flatMap(({ asset, parts }) => [
        asset,
        ...parts.map(({ partAsset }) => partAsset),
    ]);
    const ids = await SeedRepository.findAssetIdsByKeys([...new Set(keys)]);

    return runSequentially(entries, (entry, index) =>
        seedBundle(entry, index, ids)
    );
};
