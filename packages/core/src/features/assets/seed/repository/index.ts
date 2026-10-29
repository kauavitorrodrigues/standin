import { findAreaByKey } from "./findAreaByKey";
import { findAssetByKey } from "./findAssetByKey";
import { findAssetIdsByKeys } from "./findAssetIdsByKeys";
import { findAvatarBaseByKey } from "./findAvatarBaseByKey";
import { findAvatarPartByKey } from "./findAvatarPartByKey";
import { findAvatarVariation } from "./findAvatarVariation";
import { findBundleParts } from "./findBundleParts";
import { findStoredFileName } from "./findStoredFileName";
import { findTilesetByKey } from "./findTilesetByKey";
import { findTilesetIdsByKeys } from "./findTilesetIdsByKeys";

export const SeedRepository = {
    findAssetIdsByKeys,
    findTilesetIdsByKeys,
    findStoredFileName,
    findTilesetByKey,
    findAssetByKey,
    findAreaByKey,
    findBundleParts,
    findAvatarBaseByKey,
    findAvatarPartByKey,
    findAvatarVariation,
};
