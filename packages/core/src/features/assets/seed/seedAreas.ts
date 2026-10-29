import { createArea } from "../../areas/createArea";
import { replaceArea } from "../../areas/replaceArea";
import { isSameStoredFile } from "../library/utils/isSameStoredFile";
import type { LibraryContext } from "../types";
import { SEED_ACTIONS } from "./types";
import type { SeedArea, SeedItem } from "./types";
import { SeedRepository } from "./repository";
import { resolveStamp } from "./lookups/resolveStamp";
import { withSeedEntry } from "./run/withSeedEntry";
import { buildEntryLabel } from "./utils/buildEntryLabel";
import { isSameAreaData } from "./utils/isSameAreaData";
import { runSequentially } from "./utils/runSequentially";

const GLOBAL_SCOPE = null;

const seedArea = async (
    entry: SeedArea,
    context: LibraryContext
): Promise<SeedItem> => {
    const label = buildEntryLabel("areas", entry.key);
    const stamp = await resolveStamp(label, entry.stamp);
    const data = { name: entry.name, stamp };
    const image = { buffer: entry.image };
    const existing = await SeedRepository.findAreaByKey(entry.key);

    if (!existing) {
        const created = await withSeedEntry(label, () =>
            createArea(image, data, context, entry.key)
        );
        return { id: created.id, key: entry.key, action: SEED_ACTIONS.CREATE };
    }

    const unchanged =
        isSameAreaData(existing, data) &&
        (await isSameStoredFile(existing.fileName, entry.image));
    if (unchanged) {
        return {
            id: existing.id,
            key: entry.key,
            action: SEED_ACTIONS.UNCHANGED,
        };
    }

    await withSeedEntry(label, () =>
        replaceArea(existing.id, GLOBAL_SCOPE, image, data)
    );
    return { id: existing.id, key: entry.key, action: SEED_ACTIONS.UPDATE };
};

/**
 * Creates or replaces each area by key. The stamp names tilesets and assets by
 * key, so it runs after both exist. The validation is the one of the area
 * endpoints, since the same service runs it.
 */
export const seedAreas = (
    entries: SeedArea[],
    context: LibraryContext
): Promise<SeedItem[]> =>
    runSequentially(entries, (entry) => seedArea(entry, context));
