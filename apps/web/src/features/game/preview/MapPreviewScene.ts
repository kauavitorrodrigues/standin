import Phaser from "phaser";
import { GAME_SCENE_KEYS } from "@/features/game/consts/scene-keys";
import { MAP_LAYER_ORIGIN } from "@/features/game/consts/map-geometry";
import {
    buildTilemap,
    ensureAssetTextures,
    loadMapAssets,
    registerAssetAnimations,
    renderPlacedAssets,
    renderTileLayers,
} from "@/features/game/renderers";
import type { GameMapData } from "@/features/game/types/tilemap";

type InitData = { map: GameMapData };

// The map drawn as it is, the whole of it and nothing else: no player, no
// physics, no input. The camera always shows the entire map.
export class MapPreviewScene extends Phaser.Scene {
    private mapData!: GameMapData;
    private mapSize = { width: 0, height: 0 };

    constructor() {
        super({ key: GAME_SCENE_KEYS.MAP });
    }

    init(data: InitData): void {
        this.mapData = data.map;
    }

    preload(): void {
        loadMapAssets(this.load, this.mapData);
    }

    create(): void {
        const { tilemap, tilesets } = buildTilemap(this, this.mapData);
        const assets = this.mapData.assets ?? [];

        ensureAssetTextures(this.textures, assets);
        registerAssetAnimations(this, assets);
        renderTileLayers(tilemap, tilesets);
        renderPlacedAssets(
            this,
            this.mapData.placed ?? [],
            assets,
            tilemap.heightInPixels
        );

        this.mapSize = {
            width: tilemap.widthInPixels,
            height: tilemap.heightInPixels,
        };
        this.fitToViewport();
    }

    fitToViewport(): void {
        const { width, height } = this.mapSize;
        if (width === 0 || height === 0) return;

        const camera = this.cameras.main;
        camera.setZoom(Math.min(camera.width / width, camera.height / height));
        camera.centerOn(
            MAP_LAYER_ORIGIN.X + width / 2,
            MAP_LAYER_ORIGIN.Y + height / 2
        );
    }
}
