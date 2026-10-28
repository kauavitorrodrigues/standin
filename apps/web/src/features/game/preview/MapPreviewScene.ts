import Phaser from "phaser";
import { LAYOUT_LAYER_NAMES } from "@standin/contracts";
import { GAME_SCENE_KEYS } from "@/features/game/consts/scene-keys";
import { MAP_LAYER_ORIGIN } from "@/features/game/consts/map-geometry";
import {
    buildTilemap,
    ensureAssetTextures,
    loadMapAssets,
    registerAssetAnimations,
    renderPlacedAssets,
    renderTileLayers,
    renderWallTiles,
} from "@/features/game/renderers";
import type { GameMapData } from "@/features/game/types/tilemap";
import { captureMapThumbnail } from "@/features/editor/lib/captureMapThumbnail";
import type { ThumbnailDrawable } from "@/features/editor/types/thumbnail";

type InitData = {
    map: GameMapData;
    // Called once the map is drawn, with the scene able to take its photo.
    onDrawn?: (scene: MapPreviewScene) => void;
    // Called instead of throwing when drawing the map fails, for who waits on
    // `onDrawn` to know it will not come.
    onFailed?: (cause: unknown) => void;
};

// The map drawn as it is, the whole of it and nothing else: no player, no
// physics, no input. The camera always shows the entire map.
export class MapPreviewScene extends Phaser.Scene {
    private mapData!: GameMapData;
    private onDrawn?: InitData["onDrawn"];
    private onFailed?: InitData["onFailed"];
    private mapSize = { width: 0, height: 0 };
    // What a photo of the map is made of, as drawn.
    private drawables: ThumbnailDrawable[] = [];

    constructor() {
        super({ key: GAME_SCENE_KEYS.MAP });
    }

    init(data: InitData): void {
        this.mapData = data.map;
        this.onDrawn = data.onDrawn;
        this.onFailed = data.onFailed;
    }

    preload(): void {
        loadMapAssets(this.load, this.mapData);
    }

    create(): void {
        try {
            this.draw();
        } catch (cause) {
            if (!this.onFailed) throw cause;
            this.onFailed(cause);
        }
    }

    private draw(): void {
        const { tilemap, tilesets } = buildTilemap(this, this.mapData);
        const assets = this.mapData.assets ?? [];

        ensureAssetTextures(this.textures, assets);
        registerAssetAnimations(this, assets);
        const tileLayers = renderTileLayers(tilemap, tilesets, {
            skip: [LAYOUT_LAYER_NAMES.WALLS],
        });
        const walls = renderWallTiles(this, tilemap, tileLayers);
        const sprites = renderPlacedAssets(
            this,
            this.mapData.placed ?? [],
            assets,
            tilemap.heightInPixels
        );
        this.drawables = [...tileLayers, ...walls.getDisplays(), ...sprites];

        this.mapSize = {
            width: tilemap.widthInPixels,
            height: tilemap.heightInPixels,
        };
        this.fitToViewport();
        this.onDrawn?.(this);
    }

    // The whole map as a PNG at thumbnail size, whatever the camera shows.
    captureThumbnail(): Promise<Blob> {
        return captureMapThumbnail(this, this.drawables, this.mapSize);
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
