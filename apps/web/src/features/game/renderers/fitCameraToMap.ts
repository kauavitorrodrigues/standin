import type Phaser from "phaser";
import { MAP_LAYER_ORIGIN } from "@/features/game/consts/map-geometry";

export const fitCameraToMap = (
    camera: Phaser.Cameras.Scene2D.Camera,
    tilemap: Phaser.Tilemaps.Tilemap
): void => {
    camera.setBounds(
        MAP_LAYER_ORIGIN.X,
        MAP_LAYER_ORIGIN.Y,
        tilemap.widthInPixels,
        tilemap.heightInPixels
    );
};
