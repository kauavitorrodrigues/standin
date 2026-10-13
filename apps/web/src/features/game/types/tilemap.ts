import type {
    AssetDefinition,
    MapWithUrls,
    PlacedAsset,
} from "@standin/contracts";

export type GameMapData = MapWithUrls & {
    // Only the assets used in the map, deleted ones included. One texture is
    // loaded for each of them.
    assets?: AssetDefinition[];
    // The objects placed on the map, drawn over the textures of `assets`.
    placed?: PlacedAsset[];
};

export type MapSceneInitData = {
    map: GameMapData;
    initialCameraOffsetX: number;
};
