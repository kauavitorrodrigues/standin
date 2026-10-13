import { placeMapAsset } from "./place";
import { removeMapAsset } from "./remove";
import { updateMapAsset } from "./update";

export const MapAssetController = {
    place: placeMapAsset,
    update: updateMapAsset,
    remove: removeMapAsset,
};
