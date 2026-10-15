import { placeMapAsset } from "./place";
import { removeMapAsset } from "./remove";
import { updateMapAsset } from "./update";

export type { UpdateResult } from "./types/update-result";
export type { RemoveResult } from "./types/remove-result";

export const MapAssetService = {
    place: placeMapAsset,
    update: updateMapAsset,
    remove: removeMapAsset,
};
