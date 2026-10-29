import { LibrarySeedReferenceNotFoundError } from "@standin/contracts";
import type { Stamp } from "@standin/contracts";
import type { SeedStamp } from "../types";
import { SeedRepository } from "../repository";
import { replaceStampKeys } from "../utils/replaceStampKeys";

/**
 * The stamp of the file with tileset and asset ids in place of their keys.
 * Every unknown key is collected, so one run lists all of them.
 */
export const resolveStamp = async (
    entry: string,
    stamp: SeedStamp
): Promise<Stamp> => {
    const tilesetIds = await SeedRepository.findTilesetIdsByKeys(
        stamp.palette.map(({ tilesetKey }) => tilesetKey)
    );
    const assetIds = await SeedRepository.findAssetIdsByKeys(
        stamp.objects.map(({ assetKey }) => assetKey)
    );

    const { palette, objects, missing } = replaceStampKeys(
        stamp,
        tilesetIds,
        assetIds
    );
    if (missing.length > 0) {
        throw new LibrarySeedReferenceNotFoundError(entry, missing);
    }
    return { ...stamp, palette, objects };
};
