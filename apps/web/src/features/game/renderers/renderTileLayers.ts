import type Phaser from "phaser";
import { MAP_LAYER_ORIGIN } from "@/features/game/consts/map-geometry";
import { GAME_DIAGNOSTIC_MESSAGES } from "@/features/game/consts/diagnostics";

const createTileLayer = (
    tilemap: Phaser.Tilemaps.Tilemap,
    tilesets: Phaser.Tilemaps.Tileset[],
    layerData: Phaser.Tilemaps.LayerData
): Phaser.Tilemaps.TilemapLayer | null => {
    const layer = tilemap.createLayer(
        layerData.name,
        tilesets,
        MAP_LAYER_ORIGIN.X,
        MAP_LAYER_ORIGIN.Y
    );

    if (!layer) {
        console.warn(
            GAME_DIAGNOSTIC_MESSAGES.tileLayerMissing(layerData.name)
        );
    }

    return layer;
};

export const renderTileLayers = (
    tilemap: Phaser.Tilemaps.Tilemap,
    tilesets: Phaser.Tilemaps.Tileset[]
): Phaser.Tilemaps.TilemapLayer[] =>
    tilemap.layers
        .map((layerData) => createTileLayer(tilemap, tilesets, layerData))
        .filter(
            (layer): layer is Phaser.Tilemaps.TilemapLayer => layer !== null
        );
