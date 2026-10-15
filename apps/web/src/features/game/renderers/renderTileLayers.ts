import type Phaser from "phaser";
import { LAYOUT_LAYER_NAMES } from "@standin/contracts";
import { MAP_LAYER_ORIGIN } from "@/features/game/consts/map-geometry";
import { PLACED_ASSET_DEPTH } from "@/features/game/consts/placed-assets";
import { GAME_DIAGNOSTIC_MESSAGES } from "@/features/game/consts/diagnostics";

type RenderOptions = {
    // Layers that something else draws, by name. The walls are drawn tile by
    // tile with their own depth (`renderWallTiles`).
    skip?: readonly string[];
};

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
        console.warn(GAME_DIAGNOSTIC_MESSAGES.tileLayerMissing(layerData.name));
        return null;
    }

    // The foreground draws over the objects and the avatars.
    if (layerData.name === LAYOUT_LAYER_NAMES.FOREGROUND) {
        layer.setDepth(PLACED_ASSET_DEPTH.FOREGROUND);
    }

    return layer;
};

export const renderTileLayers = (
    tilemap: Phaser.Tilemaps.Tilemap,
    tilesets: Phaser.Tilemaps.Tileset[],
    { skip = [] }: RenderOptions = {}
): Phaser.Tilemaps.TilemapLayer[] =>
    tilemap.layers
        .filter((layerData) => !skip.includes(layerData.name))
        .map((layerData) => createTileLayer(tilemap, tilesets, layerData))
        .filter(
            (layer): layer is Phaser.Tilemaps.TilemapLayer => layer !== null
        );
