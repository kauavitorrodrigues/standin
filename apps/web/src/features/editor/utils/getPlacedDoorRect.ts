import {
    ASSET_TYPES,
    TILE_SIZE,
    type DoorRect,
    type EditorModel,
    type PlacedAsset,
} from "@standin/contracts";

// The footprint in pixels of a placed door, or null when the placed asset is
// not a door.
export const getPlacedDoorRect = (
    model: Readonly<EditorModel>,
    placed: PlacedAsset
): DoorRect | null => {
    const asset = model.library.assets.find(({ id }) => id === placed.assetId);
    if (asset?.type !== ASSET_TYPES.DOOR) return null;

    const height = asset.footprint.h * TILE_SIZE;

    return {
        x: placed.tileX * TILE_SIZE + placed.offsetX,
        y: (placed.tileY + 1) * TILE_SIZE + placed.offsetY - height,
        width: asset.footprint.w * TILE_SIZE,
        height,
    };
};
