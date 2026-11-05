import type {
    AssetDefinition,
    MapWithUrls,
    PlacedAsset,
    Tileset,
} from "@standin/contracts";

export type GameMapData = MapWithUrls & {
    // Only the assets used in the map, deleted ones included. One texture is
    // loaded for each of them.
    assets?: AssetDefinition[];
    // The objects placed on the map, drawn over the textures of `assets`.
    placed?: PlacedAsset[];
    // The tilesets of the map with their tile meta, which says what each floor
    // tile sounds like. `tilesets` above only has what loading needs.
    floorTilesets?: Tileset[];
};

export type MapSceneInitData = {
    map: GameMapData;
    initialCameraOffsetX: number;
};
