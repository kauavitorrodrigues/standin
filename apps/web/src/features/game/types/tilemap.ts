import type { MapWithUrls } from "@standin/contracts";

export type MapAssetManifest = MapWithUrls;

export type MapSceneInitData = {
    map: MapAssetManifest;
    initialCameraOffsetX: number;
};
