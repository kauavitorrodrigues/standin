import type Phaser from "phaser";
import { resolveCameraBounds } from "@/features/game/utils/cameraBounds";

export const fitCameraToMap = (
    camera: Phaser.Cameras.Scene2D.Camera,
    tilemap: Phaser.Tilemaps.Tilemap
): void => {
    const { x, y, width, height } = resolveCameraBounds(
        tilemap.widthInPixels,
        tilemap.heightInPixels
    );
    camera.setBounds(x, y, width, height);
};
